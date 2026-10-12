FROM node:22-alpine
WORKDIR /app
COPY package.json ./
COPY src ./src
COPY public ./public
RUN mkdir -p /app/data && chown -R node:node /app
USER node
ENV PORT=3000 HOST=0.0.0.0 CHAIN_MODE=demo DB_PATH=/app/data/registry.sqlite
EXPOSE 3000
CMD ["node","src/server.mjs"]
