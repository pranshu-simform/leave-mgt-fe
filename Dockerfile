# syntax=docker/dockerfile:1

FROM node:24-alpine AS build
# HUSKY=0: the `prepare` script installs git hooks, which a container has no use for.
ENV HUSKY=0
RUN npm install --global pnpm@11.27.1
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# The API's address is compiled into the bundle, so it is a build argument, not a runtime setting.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN pnpm build

FROM nginx:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
