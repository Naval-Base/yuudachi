FROM node:alpine

WORKDIR /usr/yuudachi

COPY . .

RUN yarn install --immutable --immutable-cache --check-cache
RUN yarn build

CMD cd /usr/yuudachi/src/handler && yarn start
