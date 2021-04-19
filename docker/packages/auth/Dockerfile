FROM node:alpine

WORKDIR /usr/yuudachi

COPY . .

RUN yarn install --immutable --immutable-cache
RUN yarn build

WORKDIR /usr/yuudachi/src/auth
RUN yarn build

CMD yarn start
