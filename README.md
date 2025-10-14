# peaq IPFS Gateway

Standalone IPFS gateway for hosting peaq network token logos and other assets.

## 🎯 Overview

This is a dedicated IPFS service running on a separate VM that provides:
- **IPFS Gateway** at `ipfs.peaq.xyz`
- **IPFS API** for content management
- **Token logo hosting** for the peaq ecosystem
- **Decentralized storage** for all peaq assets

## 🚀 Quick Start

### Prerequisites
- Ubuntu 20.04+ VM
- Docker and Docker Compose
- Node.js 18+ (for asset management)
- Domain: `ipfs.peaq.xyz`

### 1. Deploy IPFS Service

```bash
# Clone and setup
git clone <your-repo> /opt/peaq-ipfs
cd /opt/peaq-ipfs/IPFS

# Make scripts executable
chmod +x deploy.sh setup-ipfs.sh

# Deploy IPFS service
./deploy.sh
```

### 2. Upload Token Assets

```bash
# Install dependencies
npm install

# Upload existing token assets
npm run upload-assets
```

## 📁 Project Structure

```
IPFS/
├── docker-compose.yml      # IPFS service configuration
├── nginx.conf              # Nginx reverse proxy
├── package.json            # Dependencies
├── ipfs-setup.js          # IPFS configuration
├── upload-assets.js       # Asset upload script
├── deploy.sh              # Deployment script
├── setup-ipfs.sh          # IPFS setup script
└── README.md              # This file
```

## 🔧 Configuration

### IPFS Configuration
- **Gateway**: `http://localhost:8080` (local) / `https://ipfs.peaq.xyz` (production)
- **API**: `http://localhost:5001` (local) / `https://ipfs.peaq.xyz/api` (production)
- **Storage**: Persistent Docker volumes

### Network Configuration
- **Ports**: 80, 443, 5001, 8080
- **Domain**: `ipfs.peaq.xyz`
- **SSL**: Let's Encrypt certificates

## 🌐 Production Deployment

### 1. DNS Configuration
Configure DNS A record:
```
ipfs.peaq.xyz → YOUR_IPFS_VM_IP
```

### 2. SSL Certificates
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificates
sudo certbot certonly --standalone -d ipfs.peaq.xyz

# Copy certificates
sudo cp /etc/letsencrypt/live/ipfs.peaq.xyz/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/ipfs.peaq.xyz/privkey.pem ./ssl/
```

### 3. Deploy Services
```bash
# Deploy IPFS
./deploy.sh

# Upload assets
npm run upload-assets
```

## 📋 API Endpoints

### IPFS Gateway
- **GET** `/ipfs/{hash}` - Access IPFS content
- **GET** `/ipns/{name}` - Access IPNS content

### IPFS API
- **POST** `/api/v0/add` - Upload to IPFS
- **POST** `/api/v0/pin/add` - Pin content
- **GET** `/api/v0/version` - IPFS version

## 🔍 Testing

### Local Testing
```bash
# Test IPFS gateway
curl http://localhost:8080/ipfs/QmYourHash

# Test IPFS API
curl http://localhost:5001/api/v0/version
```

### Production Testing
```bash
# Test production gateway
curl https://ipfs.peaq.xyz/ipfs/QmYourHash

# Test production API
curl https://ipfs.peaq.xyz/api/v0/version
```

## 📝 Token List Integration

The token list service (running on separate VM) will reference this IPFS gateway:

```json
{
  "logoURI": "https://ipfs.peaq.xyz/ipfs/QmYourHash"
}
```

## 🛠️ Maintenance

### Adding New Assets
```bash
# Upload new assets
npm run upload-assets

# Pin important content
ipfs pin add QmYourHash
```

### Monitoring
```bash
# Check IPFS status
ipfs id

# View logs
docker-compose logs -f

# Check storage usage
ipfs repo stat
```

### Backup
```bash
# Backup IPFS data
docker-compose exec ipfs ipfs get /ipfs/QmData > backup.tar

# Backup configuration
cp -r ~/.ipfs ./ipfs-backup
```

## 🆘 Troubleshooting

### IPFS Not Starting
```bash
# Check IPFS logs
docker-compose logs ipfs

# Reset IPFS data
docker-compose down
docker volume rm ipfs_ipfs-data
docker-compose up -d
```

### Gateway Not Accessible
```bash
# Check nginx configuration
docker-compose logs nginx

# Test nginx config
docker-compose exec nginx nginx -t
```

## 📞 Support

For issues:
1. Check logs: `docker-compose logs`
2. Verify DNS: `nslookup ipfs.peaq.xyz`
3. Test connectivity: `curl -I https://ipfs.peaq.xyz`
4. Check firewall: `sudo ufw status`

## 🎉 Success!

Once deployed, your IPFS gateway will be available at:
- **IPFS Gateway**: https://ipfs.peaq.xyz
- **IPFS API**: https://ipfs.peaq.xyz/api
- **Token Logos**: https://ipfs.peaq.xyz/ipfs/{hash}
