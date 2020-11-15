FROM node:alpine

WORKDIR /usr/yuudachi

RUN npm i -g npm@7

COPY package.json package-lock.json tsconfig.base.json ./

COPY src/handler ./src/handler
COPY packages/rest ./packages/rest

RUN npm ci --legacy-peer-deps
RUN cd /usr/yuudachi/packages/rest && npm i --legacy-peer-deps && npx -p typescript tsc

CMD cd /usr/yuudachi/src/handler && npm run start
