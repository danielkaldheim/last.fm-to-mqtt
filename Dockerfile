FROM node:alpine AS builder

COPY src ./src
ADD package.json ./
ADD yarn.lock ./
ADD tsconfig.json ./
ADD webpack.config.js ./
ADD webpack.config.client.js ./
ADD .env.prod ./.env
RUN yarn install && yarn build

FROM node:alpine
RUN mkdir -p /app
WORKDIR /app
COPY --from=builder /dist/ /app/
ADD entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

EXPOSE 8080
ENTRYPOINT [ "./entrypoint.sh" ]
