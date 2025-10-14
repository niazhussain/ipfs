#!/bin/sh
set -eu

export IPFS_PATH="/data/ipfs"
PROFILE="${IPFS_PROFILE:-server}"
SWARM_TCP_PORT="${IPFS_SWARM_TCP:-4001}"
DOMAIN_HOST="${IPFS_DOMAIN:-localhost}"
GATEWAY_PORT="${IPFS_GATEWAY_PORT:-8080}"

# Ensure repo directory exists and is writable by ipfs user (uid 1000 in image)
mkdir -p "$IPFS_PATH" "$IPFS_PATH/export"
chown -R 1000:1000 "$IPFS_PATH" || true
chmod -R u+rwX,go-rwx "$IPFS_PATH" || true

if [ ! -f "${IPFS_PATH}/config" ]; then
  su-exec 1000:1000 ipfs init --profile="${PROFILE}"
  su-exec 1000:1000 ipfs config --json Swarm.DisableNatPortMap true
  su-exec 1000:1000 ipfs config --json Discovery.MDNS.Enabled false
  su-exec 1000:1000 ipfs config --json Gateway.NoDNSLink true
  su-exec 1000:1000 ipfs config Addresses.Gateway "/ip4/0.0.0.0/tcp/${GATEWAY_PORT}"
  if [ -n "${PUBLIC_IP:-}" ]; then
    su-exec 1000:1000 ipfs config Addresses.Announce "[\"/ip4/${PUBLIC_IP}/tcp/${SWARM_TCP_PORT}\",\"/ip4/${PUBLIC_IP}/udp/${SWARM_TCP_PORT}/quic-v1\"]"
  fi
  su-exec 1000:1000 ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"https://${DOMAIN_HOST}\"]"
  su-exec 1000:1000 ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"GET\",\"POST\",\"PUT\"]"
fi

# Start the daemon as ipfs user
exec su-exec 1000:1000 /usr/local/bin/start_ipfs
