## IPFS Production Stack (Nginx + Kubo)

This stack runs an IPFS Kubo gateway behind Nginx with your own TLS certificates for `ipfs.peaq.xyz`.

### Prerequisites
- Docker Engine 24+ and Docker Compose v2
- A public server with ports open:
  - 80/tcp and 443/tcp (Nginx)
  - 4001/tcp and 4001/udp (IPFS swarm TCP + QUIC)
- DNS A/AAAA records for:
  - `ipfs.peaq.xyz` → your server public IP
- Your SSL certs placed on the host as:
  - `${NGINX_CERTS_HOST_PATH}/fullchain.pem`
  - `${NGINX_CERTS_HOST_PATH}/privkey.pem`

### Files
- `docker-compose.yml`: Nginx and IPFS services
- `nginx/nginx.conf`: base Nginx config (gzip, rate limit zone)
- `nginx/conf.d/ipfs.conf`: virtual host for `ipfs.peaq.xyz`
- `scripts/bootstrap.sh`: initializes directories and starts the stack
- `systemd/ipfs-stack.service`: example systemd unit for auto-start

### Configure
1. Copy env and edit:
   ```bash
   cd /var/network/ipfs
   cp env.example .env
   $EDITOR .env
   ```
   - Ensure `IPFS_DOMAIN=ipfs.peaq.xyz`
   - Ensure `IPFS_DATA=/var/network/data`
   - Ensure `NGINX_CERTS_HOST_PATH=/var/network/ipfs/nginx/certs`
   - Optionally set `PUBLIC_IP` if behind NAT
2. Place certificates:
   ```bash
   mkdir -p $(grep ^NGINX_CERTS_HOST_PATH .env | cut -d= -f2)
   # Copy your certs into that directory as fullchain.pem and privkey.pem
   ```
3. DNS: point `ipfs.peaq.xyz` to your server IP
4. Firewall: allow 80/tcp, 443/tcp, 4001/tcp, 4001/udp

### Deploy
```bash
cd /var/network/ipfs
./scripts/bootstrap.sh
```
- First run will auto-initialize the IPFS repo and apply server-hardened settings.

### Verify
- Gateway: https://ipfs.peaq.xyz/ipfs/Qm... (use a known CID)
- Container health:
  ```bash
  docker compose ps
  docker compose logs -f nginx ipfs
  ```

### Autostart with systemd
```bash
sudo cp /var/network/ipfs/systemd/ipfs-stack.service /etc/systemd/system/ipfs-stack.service
sudo systemctl daemon-reload
sudo systemctl enable --now ipfs-stack
systemctl status ipfs-stack
```

### Operations
- Update images: `docker compose pull && docker compose up -d`
- View peers: `docker exec -it ipfs ipfs swarm peers | wc -l`
- Pin a CID (local): `docker exec -it ipfs ipfs pin add <cid>`

### Security Notes
- API is not exposed publicly. Access only inside the Docker network or via `docker exec`.
- Nginx enforces HTTPS with HSTS and hardened ciphers. You manage cert rotation.
- Rate limiting and secure headers are enabled in the vhost.

### Data Paths and Backups
- IPFS repo on host: `${IPFS_DATA}` (default `/var/network/data`)
- Back up `${IPFS_DATA}` regularly.
