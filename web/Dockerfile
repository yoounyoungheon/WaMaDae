FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG NODE_ENV
ARG NEXT_PUBLIC_WINE_EXCLUDE_CATALOG
RUN test "$NODE_ENV" = production && test -n "$NEXT_PUBLIC_WINE_EXCLUDE_CATALOG"
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_WINE_EXCLUDE_CATALOG=${NEXT_PUBLIC_WINE_EXCLUDE_CATALOG}

RUN npm run build && npm prune --omit=dev

FROM node:22-bookworm-slim

ARG NODE_ENV
ARG NEXT_PUBLIC_WINE_EXCLUDE_CATALOG
ENV NEXT_PUBLIC_WINE_EXCLUDE_CATALOG=${NEXT_PUBLIC_WINE_EXCLUDE_CATALOG}
ENV NODE_ENV=${NODE_ENV}
WORKDIR /app

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/next.config.mjs ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public

USER node

EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0"]
