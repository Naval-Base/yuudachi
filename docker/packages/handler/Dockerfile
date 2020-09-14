FROM node:alpine

WORKDIR /usr/yuudachi
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn

COPY src/handler ./src/handler
COPY packages/rest ./packages/rest

RUN yarn workspaces focus @yuudachi/rest @yuudachi/handler
RUN yarn workspaces foreach --parallel --topological-dev run build

CMD yarn workspace @yuudachi/handler run start
