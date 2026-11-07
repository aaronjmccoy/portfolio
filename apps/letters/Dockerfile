# syntax=docker/dockerfile:1
# Build context is the repository root:
#   docker build -f apps/letters/Dockerfile -t portfolio-letters .
#
# The runtime stage keeps the pnpm workspace layout (node_modules/@portfolio/ssr
# is a symlink to packages/ssr) rather than `pnpm deploy`, because Node strips
# TypeScript only outside node_modules and the server runs .ts directly.

FROM node:24-bookworm-slim AS base
RUN npm install -g pnpm@12.10.1 && rm -rf /root/.npm
WORKDIR /repo

# Every workspace package.json so the frozen lockfile matches the workspace.
FROM base AS manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/letters/package.json apps/letters/
COPY apps/shop/package.json apps/shop/
COPY apps/portfolio/package.json apps/portfolio/
COPY packages/ssr/package.json packages/ssr/
COPY packages/ui/package.json packages/ui/
COPY tools/catalog/package.json tools/catalog/

FROM manifests AS build
RUN pnpm install --frozen-lockfile --filter @portfolio/letters...
COPY tsconfig.base.json vitest.setup.ts ./
COPY packages/ssr packages/ssr
COPY packages/ui packages/ui
COPY apps/letters apps/letters
RUN pnpm --filter @portfolio/letters build

FROM manifests AS runtime
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod --filter @portfolio/letters... && pnpm store prune
COPY packages/ssr/src packages/ssr/src
COPY apps/letters/server apps/letters/server
COPY apps/letters/scripts apps/letters/scripts
COPY apps/letters/schema apps/letters/schema
COPY apps/letters/data apps/letters/data
COPY apps/letters/transcriptions apps/letters/transcriptions
COPY --from=build /repo/apps/letters/dist apps/letters/dist

WORKDIR /repo/apps/letters
USER node
ENV PORT=3001 METRICS_BIND=0.0.0.0 METRICS_PORT=9465
EXPOSE 3001 9465
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3001/healthz').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "server/index.ts"]
