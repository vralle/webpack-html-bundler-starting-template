#!/usr/bin/env bash
set -Eeuo pipefail

chown -R node:node /workspace
chmod -R 1777 /workspace

exec "$@"
