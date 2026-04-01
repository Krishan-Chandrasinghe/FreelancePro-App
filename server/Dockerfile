FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . ./
RUN npm run build


FROM node:22-alpine AS prod_deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev


FROM node:22-alpine
WORKDIR /app

RUN addgroup -S backendGrp && adduser -S backendUsr -G backendGrp

COPY --from=prod_deps --chown=backendUsr:backendGrp /app/node_modules ./node_modules
COPY --from=builder --chown=backendUsr:backendGrp /app/dist ./dist

USER backendUsr
EXPOSE 5000

CMD ["node", "./dist/server.js"]