# Deploying the letters reader to VM 104

Replaces the static germanwarletters.com site on VM 104 `webhost` (192.168.88.5) with the Node
SSR server, following the bookshop's recipe (`home-services/steps/phase-05-step-10.md`): a Compose
stack under `/opt`, the container on loopback, the webhost's Caddy in front, the edge unchanged.
The scans stay exactly where they are and Caddy keeps serving them directly.

Operator steps throughout: aaron's key is not authorised on VM 104, so commands go through
`qm guest exec 104` on the Proxmox host, or a console session.

## Before the first deploy

1. **Memory.** The VM has 2 GiB with about 1.2 GiB free after the bookshop. Raise it to 4 GiB
   (`qm set 104 --memory 4096`, then a reboot in a quiet hour; the static sites are down for the
   reboot). Approved in principle 2026-11-06.
2. **Image access.** CI publishes `ghcr.io/aaronjmccoy/portfolio-letters` on every push to `main`
   (tags `latest` and `sha-<commit>`). Make the package public in GitHub (Packages → portfolio-letters
   → Package settings → Change visibility), or `docker login ghcr.io` on the VM with a read-only PAT.
3. **Data directory** for the derived images, writable by the container's `node` user (uid 1000):
   ```sh
   mkdir -p /srv/letters-data && chown 1000:1000 /srv/letters-data
   ```
   The first run on 2026-11-07 wrote 5,511 renditions of 1,837 scans, 412 MB, in 11 minutes.
   The landing-page photos add about 2 MB under `photos/`. **That was a one-time job**: the
   renditions are assets now, kept in `/srv/letters-data` and covered by the nightly VM backup,
   and nothing in deploy, update or CI regenerates them.
4. **Compose file.** Copy `compose.yaml` to `/opt/letters/compose.yaml`. No `.env` is needed; the
   reader has no secrets.

## Deploy

```sh
cd /opt/letters
docker compose pull
# FIRST DEPLOY ONLY (done 2026-11-07): derive the responsive images (sharp, two cores: about 11 minutes).
# The compose file sets LETTERS_SCANS_DIR, LETTERS_PHOTOS_DIR and LETTERS_DATA_DIR, so no flags are needed.
docker compose run --rm letters node scripts/derive-images.ts --concurrency 2 --quiet
docker compose up -d
docker compose logs --tail 5 letters      # "letters: 12 sections, 456 letters, N transcriptions, 1836 derived images"
curl -s http://127.0.0.1:3001/healthz     # ok
curl -s http://127.0.0.1:3001/letter/440 | grep -o '<title>[^<]*</title>'
```

Then pin the image by digest in `compose.yaml` (the `pull` output prints it) so a later `up` cannot
pull a surprise.

## Caddy on the webhost

Back up first: `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.before-letters`.

Replace the site block's `file_server` with this, keeping the hostnames the existing block declares.
The scans are still files on disk, served by Caddy under `/scans/`; the derived scan images under `/img/`
and the landing page's photos under `/photos/`; everything else goes to the container. The global `trusted_proxies` block from the bookshop deploy
already covers the edge, so `{client_ip}` is the real visitor.

```caddyfile
http://germanwarletters.com, http://www.germanwarletters.com {
	encode zstd gzip
	@scans path /scans/*
	handle @scans {
		root * /srv/www/germanwarletters.com/public/german-war-letters
		uri strip_prefix /scans
		file_server
		header Cache-Control "public, max-age=31536000, immutable"
	}
	@img path /img/* /photos/*
	handle @img {
		root * /srv/letters-data
		file_server
		header Cache-Control "public, max-age=31536000, immutable"
	}
	handle {
		reverse_proxy 127.0.0.1:3001 {
			header_up X-Forwarded-For {client_ip}
		}
	}
	log
}
```

The archive's filenames contain a literal `%2F`; the app links them percent-encoded (`%252F`), so
Caddy's single decode lands on the file. Validate and reload:

```sh
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
curl -s -H 'Host: germanwarletters.com' http://127.0.0.1/letter/440 | grep -o '<title>[^<]*</title>'
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: germanwarletters.com' \
  'http://127.0.0.1/scans/Chapter%2010%20%20%20%20%20%20%20%20%20%20The%20Home%20front%252FLetter%20%23%20440%252Fpfr100313.jpg'
```

No edge change: the edge already proxies `germanwarletters.com` to the webhost's port 80, and the
Pi-hole record already exists. Rollback is `cp Caddyfile.before-letters Caddyfile && systemctl reload caddy`;
the static site is untouched underneath.

## Metrics

The container publishes `/metrics` on `192.168.88.5:9465`. Fence it to the monitoring VM in the
`DOCKER-USER` chain (ufw cannot filter published container ports; the two conntrack details are the
ones that bit the Nextcloud deploy):

```sh
iptables -I DOCKER-USER -p tcp -m conntrack --ctorigdstport 9465 --ctdir ORIGINAL ! -s 192.168.88.8 -j DROP
```

Don't persist it with `netfilter-persistent`: installing `iptables-persistent` removes ufw. On VM 104 the
rule lives in `/etc/systemd/system/letters-metrics-fence.service`, a oneshot bound to `docker.service`
that checks for the rule (`iptables -C`) before inserting it, and deletes it on stop.

On VM 107, add a scrape job to Prometheus (`/opt/monitoring`):

```yaml
- job_name: letters
  static_configs:
    - targets: ['192.168.88.5:9465']
```

Counters: `letters_http_requests_total{route,status}` and `letters_graphql_requests_total{operation}`,
plus the Node defaults under `letters_`.

## Monitors

- Uptime Kuma (VM 107): HTTP keyword monitor on `https://germanwarletters.com/letter/440`, keyword
  `Letter 440`.
- UptimeRobot: leave as is. The 2026-09-19 note still applies: only add this host once its DNS record
  is confirmed DNS-only, or an outage will be masked.

## Verify

- Through the edge from outside the LAN: `/`, `/letters`, `/chapter/ch3`, `/letter/440` return 200 with the
  server-rendered title; `/letter/nope` returns 404; `/scans/...`, `/img/...` and `/photos/letters-800.webp`
  return 200 with the immutable cache header.
- `curl http://192.168.88.5:3001/healthz` from the workstation fails (loopback only) and
  `http://192.168.88.5:9465/metrics` times out from anything but VM 107.
- Co-tenants still answer: `netarch.titanalpha.net`, `books.aaronjmccoy.com`, `mallerart.com`.
- `free -m` on the VM shows at least 500 MiB available with the reader warm.
- VM 104 is in `backup-nightly` already, which now protects `/srv/letters-data` (the renditions),
  `/opt/letters/compose.yaml` and the Caddyfile. If the data directory is ever lost, restore it from
  the backup rather than re-deriving.

## Update

`docker compose pull && docker compose up -d`, then re-pin the digest. That is the whole update; the
renditions are not touched. The only reason to run `derive-images` again is new scans in the archive (or a
release that adds an image kind, as the 2026-11 home page added `photos/`): it writes renditions only for
files that have none, whatever the timestamps say, so that run takes seconds and the existing renditions
stay as they are. `--force` is the one way to rebuild them, and nothing should need it.
