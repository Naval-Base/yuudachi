FROM node:alpine

WORKDIR /usr/yukikaze
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn
COPY packages/parser ./packages/parser

RUN yarn workspaces focus @yuudachi/parser
RUN yarn workspaces foreach --parallel run build

CMD yarn workspace @yuudachi/parser run start
