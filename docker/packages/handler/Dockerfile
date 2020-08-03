FROM node:alpine

RUN npm i -g pnpm

WORKDIR /usr/yukikaze
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY packages/handler ./packages/handler
COPY packages/rest ./packages/rest

RUN pnpm install --frozen-lockfile --filter @yuudachi/handler --filter @yuudachi/rest
RUN pnpm run build --filter @yuudachi/handler
RUN pnpm prune --prod

CMD pnpm run start --filter @yuudachi/handler
