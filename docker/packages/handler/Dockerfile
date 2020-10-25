FROM node:alpine

WORKDIR /usr/yuudachi
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn

COPY src/handler ./src/handler
COPY packages/api ./packages/api
COPY packages/rest ./packages/rest
COPY packages/types ./packages/types

RUN yarn workspaces focus @yuudachi/service_handler
RUN yarn workspaces foreach --parallel --topological-dev run build

CMD yarn workspace @yuudachi/service_handler run start
