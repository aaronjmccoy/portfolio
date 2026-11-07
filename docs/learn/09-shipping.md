# Lesson 9: shipping it

**Claim on the resume:** "Packaged as a Docker image built and smoke-tested in GitHub Actions, deployed behind Caddy
with LAN-only Prometheus metrics." And from the deploy: 5,511 renditions, live since 2026-11-07.

**Files:** `apps/letters/Dockerfile`, `.dockerignore`, `apps/letters/deploy/compose.yaml`,
`apps/letters/deploy/README.md`, `.github/workflows/ci.yml`, `packages/ssr/src/metrics.ts`.

## The words

**Image and container.** A Docker image is a frozen filesystem: Node, your built app, its
dependencies, and a command to start it. A container is that image running as an isolated
process. The same image runs identically on a laptop, in CI and on the VM; "works on my machine"
stops being a category.

**Dockerfile and layers.** The recipe. Each instruction (`COPY`, `RUN`) makes a cached layer; if
the inputs to a layer have not changed, Docker reuses it. Copying the lockfile and installing
*before* copying source means a source change does not reinstall dependencies.

**Multi-stage build.** Several `FROM` sections in one Dockerfile. Early stages have compilers and
dev dependencies; the final stage copies only what runs. The shipped image is smaller and has less
in it to exploit.

**Docker Compose.** A YAML file that says how to run the container: image, ports, mounts, memory
limit, restart policy. `docker compose up -d` starts it; `pull` then `up` updates it.

**CI (continuous integration).** Automated checks on every push. Here GitHub Actions runs lint,
typecheck, unit tests, builds, e2e, then builds the image.

**Smoke test.** Boot the real thing and load one page. It proves the parts fit together, which no
number of unit tests does.

**Registry.** Where images live between build and deploy. GitHub Container Registry (GHCR) here,
as `ghcr.io/aaronjmccoy/portfolio-letters`.

**Tag versus digest.** `latest` is a moving name; a digest (`sha256:…`) is the content hash of one
exact image. Pinning the deploy to a digest makes it reproducible and makes a rollback a one-line
change.

**Reverse proxy.** A server in front of the app. Caddy terminates HTTPS and fetches certificates
automatically, serves the scans and renditions straight from disk with long cache headers, and
forwards everything else to the app over loopback.

**Loopback and the LAN.** The app binds `127.0.0.1:3001`, reachable only from the same VM, so
Caddy is the only way in. Metrics bind the VM's LAN address so the monitoring VM can scrape them,
with a firewall rule allowing only that VM.

**Prometheus metrics.** A `/metrics` endpoint in plain text (request counts, durations, GraphQL
operations by name) that a Prometheus server pulls every few seconds and Grafana graphs.

**Health check.** `/healthz` returns 200 when the process is ready. Docker's `HEALTHCHECK` and the
CI smoke step both use it.

## The interview answer

**"How is the letters site deployed?"**

> As a Docker image built in GitHub Actions. The Dockerfile has three stages: one with only the
> lockfile and package manifests so the install layer caches, one that builds the app, and a
> runtime stage with a production-only install plus the built output, running as a non-root user
> with a health check. CI builds that image and then actually runs it: curls the health endpoint,
> fetches a letter page and checks the title, checks that an unknown letter is a 404. Only then
> does it push to GitHub's registry. On the VM a Compose file runs it with the app port on loopback
> behind Caddy, the archive mounted read-only, a volume for the derived images, a read-only root
> filesystem and a memory limit. Caddy serves the scans and renditions from disk and proxies the
> rest. An update is pull, up, and re-pin the digest.

**"What did CI prove before you shipped?"**

> That the image boots and renders a real page, not just that the code compiles. Unit tests pass
> on a broken Dockerfile; a `COPY` that misses the `transcriptions` folder only shows up when
> something starts the container and asks for a letter. So the image job is: build, run, curl,
> grep the title, check the 404, then push.

**"Anything go wrong?"**

> pnpm has a `deploy` command that flattens a workspace package into a standalone folder, which is
> the usual way to make a small runtime image. It could not be used here: the server imports the
> shared SSR package as TypeScript source and Node's type stripping refuses `.ts` files under
> `node_modules`. Keeping the workspace symlink layout in the runtime stage was the fix, and the
> Dockerfile's header explains it so nobody re-tries the obvious thing.

**Likely follow-ups**

- *"Why three stages?"* Cache, build, ship. A one-stage image would carry the compiler, dev
  dependencies and source, and it would reinstall on every source change.
- *"Why is the app on loopback and metrics on the LAN address?"* Caddy is the only client the app
  should have; Prometheus on another VM is the only client metrics should have.
- *"Where are the secrets?"* None in this app. The shop's Storefront and Admin tokens will be
  environment variables from a gitignored `.env`, never in the image.
- *"How does an update roll out and what is never rebuilt?"* Pull and up; the renditions volume
  is an asset and survives every update.

## How it was built here

The Dockerfile stages: `manifests` (lockfile and every workspace `package.json` →
`pnpm install --frozen-lockfile`), `build` (`--filter @portfolio/letters...`, copy sources, build),
`runtime` (`--prod` install, then `packages/ssr/src`, `server`, `scripts`, `schema`, `data`,
`transcriptions`, and `dist`; user `node`; `HEALTHCHECK` on `/healthz`).

`ci.yml` jobs: `check` (lint, typecheck, tests, builds, `scripts/smoke.ts`), `e2e` (lesson 7),
`image-letters` (Buildx build, `docker run -p 3001:3001`, curl `/healthz`, grep `<title>Letter 440`,
404 check, then GHCR push of `latest` and `sha-<commit>` on `main`).

`deploy/README.md` is the runbook: Compose under `/opt/letters`; Caddy serves `/scans/*` and
`/img/*` with a one-year immutable cache header and `reverse_proxy`s the rest; metrics on
`192.168.88.5:9465` fenced in the `DOCKER-USER` iptables chain (ufw cannot filter published
container ports; the rule needs `--ctorigdstport` and `--ctdir ORIGINAL`); pin by digest after the
first pull.

## Try it (needs Docker Desktop)

```sh
docker build -f apps/letters/Dockerfile -t portfolio-letters .
docker run --rm -p 3001:3001 portfolio-letters
curl -s http://localhost:3001/healthz
curl -s http://localhost:3001/letter/440 | grep -o '<title>[^<]*</title>'
docker run --rm -p 3001:3001 -p 9465:9465 portfolio-letters   # then: curl http://localhost:9465/metrics | grep letters_
```

Read a CI run on GitHub: Actions → CI → `image-letters` → "Boot the image and render a page".
`docker image ls` and compare the size of the final image to the build stage.

## Say it out loud, without notes

- What is a Docker image? What is a multi-stage build and why use one?
- What does the smoke step in CI prove that the unit tests do not?
- What is a reverse proxy, and what does Caddy do here besides proxying?
- Why loopback for the app and the LAN address for metrics?
- What is in the renditions volume, who writes it, and what happens on an update?
