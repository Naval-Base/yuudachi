FROM node:10-alpine AS build
WORKDIR /usr/src/yukikaze
COPY package.json yarn.lock .yarnclean ./
RUN apk add --update \
&& apk add --no-cache ca-certificates \
&& apk add --no-cache --virtual .build-deps git curl build-base python g++ make \
&& yarn install \
&& apk del .build-deps

FROM node:10-alpine
LABEL name "Yukikaze"
LABEL version "0.1.0"
LABEL maintainer "iCrawl <icrawltogo@gmail.com>"
WORKDIR /usr/src/yukikaze
COPY --from=build /usr/src/yukikaze .
COPY . .
RUN yarn build
ENV NODE_ENV= \
	COMMAND_PREFIX= \
	OWNERS= \
	TOKEN= \
	LOGS= \
	WEBHOOK_ID= \
	WEBHOOK_TOKEN= \
	DB= \
	SENTRY= \
	GITHUB_API_KEY=
CMD ["node", "dist/yukikaze.js"]
