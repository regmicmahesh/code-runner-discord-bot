FROM oven/bun:1.3.4-slim AS build

RUN apt-get update && \
  apt-get install --no-install-recommends -y golang python3 &&  \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production
COPY . .
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]