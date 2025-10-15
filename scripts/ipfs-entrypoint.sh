#!/bin/sh
set -eu

export IPFS_PATH="/data/ipfs"
PROFILE="${IPFS_PROFILE:-server}"
SWARM_TCP_PORT="${IPFS_SWARM_TCP:-4001}"
DOMAIN_HOST="${IPFS_DOMAIN:-localhost}"
GATEWAY_PORT="${IPFS_GATEWAY_PORT:-8080}"

# Ensure repo directory exists and is writable
mkdir -p "$IPFS_PATH" "$IPFS_PATH/export"
chmod -R u+rwX,go-rwx "$IPFS_PATH" || true

if [ ! -f "${IPFS_PATH}/config" ]; then
  ipfs init --profile="${PROFILE}"
  ipfs config --json Swarm.DisableNatPortMap true
  ipfs config --json Discovery.MDNS.Enabled false
  ipfs config --json Gateway.NoDNSLink true
  ipfs config Addresses.Gateway "/ip4/0.0.0.0/tcp/${GATEWAY_PORT}"
  if [ -n "${PUBLIC_IP:-}" ]; then
    ipfs config Addresses.Announce "[\"/ip4/${PUBLIC_IP}/tcp/${SWARM_TCP_PORT}\",\"/ip4/${PUBLIC_IP}/udp/${SWARM_TCP_PORT}/quic-v1\"]"
  fi
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"https://${DOMAIN_HOST}\"]"
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"GET\",\"POST\",\"PUT\"]"
fi

exec /usr/local/bin/start_ipfs
