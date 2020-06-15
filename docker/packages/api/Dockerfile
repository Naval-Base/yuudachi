FROM node:alpine

RUN npx pnpm add -g pnpm && pnpm add -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/api ./packages/api

RUN pnpm install --frozen-lockfile --filter api
RUN pnpm run build --filter api
RUN pnpm prune --prod

CMD pnpm run start --filter api
