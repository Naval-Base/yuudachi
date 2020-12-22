FROM node:alpine

WORKDIR /usr/yuudachi

COPY . .

RUN npm ci
RUN npm run build

CMD cd /usr/yuudachi/src/auth && npm run start
