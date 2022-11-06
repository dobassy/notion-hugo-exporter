FROM node:18.12.0-slim

WORKDIR /work

RUN \
  apt-get update -qq && \
  apt-get install -y \
  webp \
  && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY package*.json tsconfig.json ./
COPY bin/ ./bin/
COPY src/ ./src/
COPY types/ ./types/

RUN \
  npm install &&\
  npm link

CMD ["notion-hugo"]