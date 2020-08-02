FROM node:alpine

RUN npm i -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/api ./packages/api
COPY packages/rest ./packages/rest

RUN pnpm install --frozen-lockfile --filter api --filter rest
RUN pnpm run build --filter api
RUN pnpm prune --prod

CMD pnpm run start --filter api
