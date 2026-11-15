# Deploying the shop to VM 104

Replaces the static mallerart.com site (Megan's earlier design portfolio) on VM 104 `webhost`
(192.168.88.5) with the Node SSR storefront, following the letters reader's recipe
(`apps/letters/deploy/README.md`): a Compose stack under `/opt/shop`, the container on loopback,
the webhost's Caddy in front, the edge unchanged. The old site's files stay where they are in
`/srv/www/mallerart.com/public`, so rollback is a Caddyfile restore.

Commands go through `qm guest exec 104` on the Proxmox host (`ssh -i ~/.ssh/id_ed25519_titanalpha
root@192.168.88.10`); aaron's key is not authorised on VM 104.

## Before the first deploy

1. **Image access.** CI publishes `ghcr.io/aaronjmccoy/portfolio-shop` on every push to `main`
   (tags `latest` and `sha-<commit>`). Make the package public as letters is (GitHub → Packages →
   portfolio-shop → Package settings → Change visibility); the VM pulls anonymously.
2. **Secrets.** `/opt/shop/.env`, mode 600, root-owned, with the four `SHOPIFY_*` values from
   `apps/shop/.env`. The private Storefront token stays on the server; the browser talks to the
   app's `/graphql` proxy and never sees it. Send the file through `qm guest exec --pass-stdin`
   without echoing it.
3. **Compose file.** Copy `compose.yaml` to `/opt/shop/compose.yaml`.

## Deploy

```sh
cd /opt/shop
docker compose pull
docker compose up -d
docker compose logs --tail 5 shop      # "shop prod listening on http://localhost:3002"
curl -s http://127.0.0.1:3002/healthz  # ok
curl -s http://127.0.0.1:3002/ | grep -o '<title>[^<]*</title>'
```

Then pin the image by digest in `compose.yaml`.

## Caddy on the webhost

Back up first: `cp /etc/caddy/Caddyfile /etc/caddy/Caddyfile.before-shop`.

Replace the mallerart.com site block's `root` and `file_server` with a proxy to the container,
keeping the hostnames the block declares. Built assets are fingerprinted, so they get a year's
cache; pages are rendered per request and carry no cache header.

```caddyfile
http://mallerart.com, http://www.mallerart.com {
	encode zstd gzip
	@assets path /assets/*
	header @assets Cache-Control "public, max-age=31536000, immutable"
	reverse_proxy 127.0.0.1:3002 {
		header_up X-Forwarded-For {client_ip}
	}
	log
}
```

`X-Forwarded-For` carries the visitor's address, which the app passes to Shopify as the buyer IP
so Storefront API rate limits apply per visitor rather than to the server. The global
`trusted_proxies` block from the bookshop deploy already makes `{client_ip}` the real visitor.

```sh
caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy
curl -s -H 'Host: mallerart.com' http://127.0.0.1/ | grep -o '<title>[^<]*</title>'
```

No edge change: the edge already proxies mallerart.com to the webhost's port 80, and the Pi-hole
record and Cloudflare DNS already exist. Rollback:
`cp /etc/caddy/Caddyfile.before-shop /etc/caddy/Caddyfile && systemctl reload caddy`.

## Checkout

While the Shopify store password is on (Settings → Online store → Store access), visitors can
browse and fill a cart, but Shopify's checkout refuses them. Remove the password when prices,
weights, shipping rates and payments are ready.

## Later

- **Metrics.** The container publishes `/metrics` on loopback only. To scrape it from VM 107,
  publish `192.168.88.5:9466`, fence it in `DOCKER-USER` as letters does, and add a `shop` job.
- **Monitors.** Uptime Kuma keyword monitor on `https://mallerart.com/`, keyword `Maller Art`.

## Update

`docker compose pull && docker compose up -d`, then re-pin the digest.
