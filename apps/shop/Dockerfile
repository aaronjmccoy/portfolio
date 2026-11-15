# syntax=docker/dockerfile:1
# Build context is the repository root:
#   docker build -f apps/shop/Dockerfile -t portfolio-shop .
#
# Same recipe as apps/letters/Dockerfile: the runtime stage keeps the pnpm
# workspace layout because Node strips TypeScript only outside node_modules and
# the server runs .ts directly. No secrets are baked in; the Shopify domain and
# Storefront token arrive as environment variables at run time.

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
RUN pnpm install --frozen-lockfile --filter @portfolio/shop...
COPY tsconfig.base.json vitest.setup.ts ./
COPY packages/ssr packages/ssr
COPY packages/ui packages/ui
COPY apps/shop apps/shop
RUN pnpm --filter @portfolio/shop build

FROM manifests AS runtime
ENV NODE_ENV=production
RUN pnpm install --frozen-lockfile --prod --filter @portfolio/shop... && pnpm store prune
COPY packages/ssr/src packages/ssr/src
COPY apps/shop/server apps/shop/server
# server/index.ts imports the cart cookie name from src at run time
COPY apps/shop/src/cart/cookie.ts apps/shop/src/cart/cookie.ts
COPY --from=build /repo/apps/shop/dist apps/shop/dist

WORKDIR /repo/apps/shop
USER node
ENV PORT=3002 METRICS_BIND=0.0.0.0 METRICS_PORT=9466
EXPOSE 3002 9466
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "fetch('http://127.0.0.1:3002/healthz').then(r => process.exit(r.ok ? 0 : 1), () => process.exit(1))"
CMD ["node", "server/index.ts"]
