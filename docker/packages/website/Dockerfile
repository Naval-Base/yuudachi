FROM node:alpine

WORKDIR /usr/yuudachi

COPY . .

RUN npm ci

CMD cd /usr/yuudachi/src/website && npm run start
