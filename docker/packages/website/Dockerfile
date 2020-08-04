FROM node:alpine

WORKDIR /usr/yukikaze
COPY package.json yarn.lock tsconfig.base.json .yarnrc.yml ./
COPY .yarn ./.yarn

COPY src/website ./src/website

RUN yarn workspaces focus @yuudachi/website
RUN yarn workspaces foreach --parallel run build

CMD yarn workspace @yuudachi/website run start
