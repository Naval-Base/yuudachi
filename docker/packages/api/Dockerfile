FROM node:alpine

WORKDIR /usr/yuudachi
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn

COPY src/api ./src/api
COPY packages/rest ./packages/rest
COPY packages/types ./packages/types

RUN yarn workspaces focus @yuudachi/service_api
RUN yarn workspaces foreach --parallel --topological-dev run build

CMD yarn workspace @yuudachi/service_api run start
