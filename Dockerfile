FROM node:alpine

WORKDIR /usr/yukikaze
RUN npx pnpm add -g pnpm

ADD . .

RUN pnpm i -r --frozen-lockfile
RUN pnpm run -r build
