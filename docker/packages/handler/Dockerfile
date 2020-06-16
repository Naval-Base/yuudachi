FROM node:alpine

RUN npx pnpm add -g pnpm && pnpm add -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/handler ./packages/handler

RUN pnpm install --frozen-lockfile --filter handler
RUN pnpm run build --filter handler
RUN pnpm prune --prod

CMD pnpm run start --filter handler
