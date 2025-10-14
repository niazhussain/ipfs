#!/bin/sh
set -eu

IPFS_REPO="/data/ipfs"
PROFILE="${IPFS_PROFILE:-server}"
SWARM_TCP_PORT="${IPFS_SWARM_TCP:-4001}"
DOMAIN_HOST="${IPFS_DOMAIN:-localhost}"

if [ ! -f "${IPFS_REPO}/config" ]; then
  ipfs init --profile="${PROFILE}"
  ipfs config --json Swarm.DisableNatPortMap true
  ipfs config --json Discovery.MDNS.Enabled false
  ipfs config --json Gateway.NoDNSLink true
  if [ -n "${PUBLIC_IP:-}" ]; then
    ipfs config Addresses.Announce "[\"/ip4/${PUBLIC_IP}/tcp/${SWARM_TCP_PORT}\",\"/ip4/${PUBLIC_IP}/udp/${SWARM_TCP_PORT}/quic-v1\"]"
  fi
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin "[\"https://${DOMAIN_HOST}\"]"
  ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods "[\"GET\",\"POST\",\"PUT\"]"
fi

exec /usr/local/bin/start_ipfs
