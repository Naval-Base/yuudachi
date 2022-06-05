FROM node:16-alpine AS build

WORKDIR /usr/yuudachi
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --legacy-peer-deps --audit=false --fund=false
COPY src ./src
RUN npm run build

FROM node:16-alpine

WORKDIR /usr/yuudachi
COPY package.json package-lock.json ./
COPY --from=build /usr/yuudachi/dist ./dist
RUN npm ci --legacy-peer-deps --audit=false --fund=false --production
CMD ["node", "--enable-source-maps", "./dist/index.js"]
