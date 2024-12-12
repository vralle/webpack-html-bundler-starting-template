#!/usr/bin/env bash
set -Eeuo pipefail

chown -R node:node /workspaces/
chmod -R 1777 /workspaces/

exec "$@"
