FROM node:23-alpine AS base

FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
RUN apk add vim bash jq

WORKDIR /app

COPY . ./


RUN npm i -g pnpm
# Download zk-app cli for key management

RUN pnpm install
# generate prisma client
RUN npx prisma generate     

CMD [ "pnpm" , "start" ]


EXPOSE 8000

