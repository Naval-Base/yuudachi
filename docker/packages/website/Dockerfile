FROM node:alpine

WORKDIR /usr/yuudachi

RUN npm i -g npm@7

COPY package.json package-lock.json tsconfig.base.json ./

COPY src/website ./src/website

RUN npm ci --legacy-peer-deps

CMD cd /usr/yuudachi/src/website && npm run start
