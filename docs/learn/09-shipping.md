# Lesson 9: shipping it

**Claim:** "Packaged as a Docker image built and smoke-tested in GitHub Actions, deployed behind Caddy
with LAN-only Prometheus metrics." And from the deploy: 5,511 renditions, live since 2026-11-07.

**Files:** `apps/letters/Dockerfile`, `.dockerignore`, `apps/letters/deploy/compose.yaml`,
`apps/letters/deploy/README.md`, `.github/workflows/ci.yml`, `packages/ssr/src/metrics.ts`.

## The image

Read the Dockerfile top to bottom. Three stages:

1. `manifests`: only the lockfile and every workspace `package.json`, so `pnpm install
   --frozen-lockfile` is cached until a dependency changes.
2. `build`: installs with `--filter @portfolio/letters...` (the app and what it depends on),
   copies sources, runs `pnpm --filter @portfolio/letters build`.
3. `runtime`: a fresh install with `--prod`, then copies only what the server needs at run time:
   `packages/ssr/src`, `server`, `scripts`, `schema`, `data`, `transcriptions`, and `dist` from the
   build stage. Runs as `node`, not root. A `HEALTHCHECK` hits `/healthz`.

The decision that cost time: `pnpm deploy` (which flattens a workspace package into a standalone
folder) could not be used, because Node's type stripping refuses `.ts` files under `node_modules`
and the server imports `@portfolio/ssr/src/index.ts` directly. Keeping the workspace symlink layout
in the runtime stage was the fix. The Dockerfile's header comment records it.

## CI

`ci.yml` has three jobs:

- `check`: lint, typecheck, unit tests, builds, and `scripts/smoke.ts` (boots each app from its build
  and hits `/`, `/healthz`, `/graphql`).
- `e2e`: Playwright with Chromium against the production build (lesson 7).
- `image-letters`: builds the image with Buildx, **runs it** (`docker run -p 3001:3001`), curls
  `/healthz`, greps `<title>Letter 440` from `/letter/440`, checks `/letter/nope` is 404, and only
  then logs in to GHCR and pushes `latest` and `sha-<commit>` on `main`.

The point to make in an interview: an image is not "built" until something has booted it and
rendered a page.

## The deploy

`deploy/README.md` is the runbook, written before the deploy and corrected after it. The shape:

- Compose stack under `/opt/letters`; the app port bound to `127.0.0.1:3001`; the archive mounted
  read-only; a data volume for renditions; `read_only: true` with a tmpfs `/tmp`; a memory limit.
- The webhost's Caddy in front: `/scans/*` and `/img/*` are files on disk served by Caddy with a
  one-year immutable cache header; everything else is `reverse_proxy` to the container. The edge
  proxy and DNS did not change.
- Metrics on a second listener (`packages/ssr/src/metrics.ts`) bound to the LAN address, published
  on `192.168.88.5:9465`, and fenced in the `DOCKER-USER` iptables chain so only the monitoring
  VM can scrape it. ufw cannot filter published container ports; the runbook says why the rule
  needs `--ctorigdstport` and `--ctdir ORIGINAL`.
- Pin the image by digest after the first pull.
- Update = `docker compose pull && docker compose up -d`, then re-pin. Renditions are never rebuilt.

## Try it (needs Docker Desktop)

```sh
docker build -f apps/letters/Dockerfile -t portfolio-letters .
docker run --rm -p 3001:3001 portfolio-letters
curl -s http://localhost:3001/healthz
curl -s http://localhost:3001/letter/440 | grep -o '<title>[^<]*</title>'
docker run --rm -p 3001:3001 -p 9465:9465 portfolio-letters   # then: curl http://localhost:9465/metrics | grep letters_
```

Read a CI run on GitHub: Actions → CI → the `image-letters` job → "Boot the image and render a page".

## Say it out loud

- Why three Docker stages? What would a one-stage image contain that it should not?
- What does the smoke step in CI prove that the unit tests do not?
- Why is the app port on loopback and the metrics port on the LAN address?
- What is in `/srv/letters-data`, who writes it, and what happens on an update?
- Where are the secrets? (There are none in this app. Where will the shop's live?)
