ARG NODE_VERSION="22"

FROM node:${NODE_VERSION}-alpine AS nodebuild

FROM ghcr.io/hassio-addons/base:18.2.1

# Install Node.js
RUN apk add --no-cache libstdc++ bash
COPY --from=nodebuild /usr/local/bin/node /usr/local/bin/
COPY --from=nodebuild /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN \
    ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx && \
    ln -s ../lib/node_modules/corepack/dist/corepack.js /usr/local/bin/corepack
RUN corepack enable

ENV SUPERVISOR_TOKEN=""
VOLUME /config

COPY --chmod=755 addon.docker-entrypoint.sh /docker-entrypoint.sh

ARG PACKAGE_VERSION="unknown"
LABEL \
  org.opencontainers.image.title="Home Assistant App: Hey Matter" \
  org.opencontainers.image.description="将 Home Assistant 的实体发布到任意 Matter 兼容控制器的 Bridge 模拟器" \
  org.opencontainers.image.source="https://github.com/sctale/hey-matter" \
  org.opencontainers.image.licenses="Apache-2.0" \
  io.hass.version="$PACKAGE_VERSION" \
  io.hass.type="app" \
  io.hass.arch="armhf|aarch64|i386|amd64"

RUN mkdir /install
COPY package.tgz /install/package.tgz
RUN npm install -g /install/package.tgz
RUN rm -rf /install

CMD ["/docker-entrypoint.sh"]
