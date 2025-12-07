FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

COPY . /usr/yuudachi
WORKDIR /usr/yuudachi

RUN npm --global install corepack@latest
RUN corepack enable
RUN corepack install

FROM base AS builder

RUN pnpm --filter yuudachi... install --frozen-lockfile --ignore-scripts
RUN pnpm --filter yuudachi build

FROM builder AS pruned

RUN pnpm --filter yuudachi --prod deploy --legacy pruned

FROM node:24-alpine AS yuudachi

WORKDIR /usr/yuudachi

RUN npm --global install pnpm@latest-10

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 yuudachi
USER yuudachi

COPY --from=pruned /usr/yuudachi/pruned .

CMD pnpm --filter yuudachi migrate && pnpm --filter yuudachi start
