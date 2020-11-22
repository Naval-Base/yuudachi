FROM node:alpine

WORKDIR /usr/yuudachi

RUN npm i -g npm@next-7

COPY package.json package-lock.json tsconfig.base.json ./

COPY src ./src
COPY packages ./packages

RUN npm ci --legacy-peer-deps
RUN npm run build

CMD cd /usr/yuudachi/src/handler && npm run start
