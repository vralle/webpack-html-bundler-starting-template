# From debian latest
FROM mcr.microsoft.com/devcontainers/typescript-node

RUN set -eux; \
    apt-get update; \
    apt-get upgrade --yes --no-install-recommends; \
    apt-get install default-jre --yes --no-install-recommends; \
    rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint.sh /usr/local/bin/
ENTRYPOINT ["docker-entrypoint.sh"]