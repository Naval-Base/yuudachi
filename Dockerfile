FROM node:10-alpine

LABEL name "Yukikaze"
LABEL version "0.1.0"
LABEL maintainer "iCrawl <icrawltogo@gmail.com>"

WORKDIR /usr/src/yukikaze

COPY package.json yarn.lock ./

RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install \
&& apk del .build-deps

COPY . .

ENV NODE_ENV= \
	COMMAND_PREFIX= \
	OWNERS= \
	TOKEN= \
	DB= \
	REDIS= \
	RAVEN= \
	GITHUB_API_KEY=

CMD ["node", "src/yukikaze.js"]
