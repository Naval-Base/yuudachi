FROM node:alpine

RUN npm i -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/parser ./packages/parser

RUN pnpm install --frozen-lockfile --filter parser
RUN pnpm run build --filter parser
RUN pnpm prune --prod

CMD pnpm run start --filter parser
