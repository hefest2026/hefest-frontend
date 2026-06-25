# Multi-stage production image for hefest-frontend.
#
# Stage 1 builds the Vite/React SPA with Bun; stage 2 serves the static bundle
# with nginx. The SPA is served under /hefest-frontend/ so it can sit behind the
# same Traefik entrypoint as the API, which owns the root namespace.

FROM oven/bun:1.3.9-alpine AS builder

WORKDIR /app

# Install deps in a layer keyed only on the lockfiles so source changes don't
# bust the dependency cache.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build the production bundle (tsc -b && vite build -> /app/dist).
COPY . .
RUN bun run build


FROM nginx:1.27-alpine AS runtime

# SPA served under /hefest-frontend/ (see nginx.conf).
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/hefest-frontend

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=5s --retries=5 --start-period=10s \
    CMD wget -qO- http://127.0.0.1/hefest-frontend/health || exit 1
