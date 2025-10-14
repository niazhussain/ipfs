#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STACK_DIR=$(cd "${SCRIPT_DIR}/.." && pwd)
cd "${STACK_DIR}"

if [ -f .env ]; then
  set -a
  source .env
  set +a
else
  if [ -f .env.example ]; then
    echo "No .env found. Copying from .env.example ..."
    cp .env.example .env
  elif [ -f env.example ]; then
    echo "No .env found. Copying from env.example ..."
    cp env.example .env
  else
    echo "No env example found; please create .env or env.example"
    exit 1
  fi
  set -a
  source .env
  set +a
fi

# Create data directories
mkdir -p "${IPFS_DATA}"
mkdir -p "${IPFS_DATA}/export"

# Create certs directory placeholder for user-provided certs
mkdir -p "${NGINX_CERTS_HOST_PATH}"
if [ ! -f "${NGINX_CERTS_HOST_PATH}/fullchain.pem" ] || [ ! -f "${NGINX_CERTS_HOST_PATH}/privkey.pem" ]; then
  echo "WARNING: SSL certs not found in ${NGINX_CERTS_HOST_PATH}. Place fullchain.pem and privkey.pem before exposing 443."
fi

# IPFS repo directory should be writable by uid 1000 (kubo user)
chown -R 1000:1000 "${IPFS_DATA}" || true

# Pull and start
DOCKER_COMPOSE_BIN="$(command -v docker) compose"
${DOCKER_COMPOSE_BIN} pull
${DOCKER_COMPOSE_BIN} up -d

# Show status
${DOCKER_COMPOSE_BIN} ps
