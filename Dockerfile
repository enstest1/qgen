FROM node:22-alpine
RUN apk add --no-cache su-exec
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
RUN mkdir -p /app/data && chown -R node:node /app
ENV PORT=3000 HOST=0.0.0.0 CHAIN_MODE=demo DB_PATH=/data/registry.sqlite
EXPOSE 3000
CMD ["sh","-c","mkdir -p /data && chown node:node /data && exec su-exec node node src/server.mjs"]
