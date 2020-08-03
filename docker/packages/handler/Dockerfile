FROM node:alpine

WORKDIR /usr/yukikaze
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/handler ./packages/handler
COPY packages/rest ./packages/rest

RUN yarn workspaces focus @yuudachi/rest @yuudachi/handler
RUN yarn workspaces foreach --parallel --topological-dev run build

CMD yarn workspace @yuudachi/handler run start
