FROM node:alpine

RUN npx pnpm add -g pnpm && pnpm add -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/parser ./packages/parser
COPY packages/types ./packages/types

RUN pnpm install --frozen-lockfile --filter parser
RUN pnpm run build --filter parser
RUN pnpm prune --prod

CMD pnpm run start --filter parser
