# peaq IPFS Gateway - Authenticated Access

Secure IPFS gateway for the peaq network with authentication-based write access for trusted IPs.

## 📁 Project Structure & Scripts

```
ipfs/
├── docker-compose.yml          # IPFS + Nginx
├── configs/                    # All Nginx-related configuration
│   ├── nginx.conf              # Reverse proxy with Basic Auth and IP allowlist
│   ├── auth-ips.conf          # IP whitelist (edit to add your IPs)
│   ├── .htpasswd              # Basic auth credentials (auto-generated)
│   └── ssl/                   # SSL certificates (optional)
├── deploy.sh                  # One-command deployment and checks
└── README.md                  # This documentation
```

## 🔧 Script Purposes

### **🚀 Deployment Scripts**

#### **`deploy.sh`** - Main Deployment Script
- **Purpose**: Deploy the complete authenticated IPFS infrastructure
- **What it does**:
  - Checks Docker availability
  - Creates necessary directories (ssl, logs, ipfs-config)
  - Loads environment variables from .env
  - Builds and starts all services (IPFS, Auth Proxy, Nginx)
  - Verifies service health
  - Provides deployment status and next steps
- **Usage**: `./deploy.sh`

#### **`setup-ipfs.sh`** - Standalone IPFS Setup
- **Purpose**: Set up IPFS node without Docker (alternative method)
- **What it does**:
  - Downloads and installs IPFS binary
  - Initializes IPFS repository
  - Configures IPFS for production (gateway, API, CORS)
  - Starts IPFS daemon
  - Verifies IPFS functionality
- **Usage**: `./setup-ipfs.sh` (for non-Docker deployments)

### **📤 Upload Scripts**

#### **`ipfs-setup.js`** - Authenticated Upload Engine
- **Purpose**: Core upload functionality with authentication
- **What it does**:
  - Connects to IPFS using API key authentication
  - Uploads files/directories to IPFS
  - Pins important files to prevent garbage collection
  - Saves upload results with timestamps
  - Provides detailed logging and error handling
- **Usage**: `API_KEY=your-key node ipfs-setup.js`

#### **`upload-assets.js`** - Asset Upload Wrapper
- **Purpose**: User-friendly wrapper for asset uploads
- **What it does**:
  - Checks for required environment variables
  - Calls the core upload functionality
  - Provides usage examples and access URLs
  - Handles authentication errors gracefully
- **Usage**: `API_KEY=your-key npm run upload-assets`

### **🔐 Security Scripts**

#### **`auth-proxy/server.js`** - Authentication Proxy Server
- **Purpose**: Secure gateway between public and IPFS API
- **What it does**:
  - Validates IP addresses against whitelist
  - Authenticates API key for write operations
  - Implements rate limiting per IP
  - Proxies authorized requests to IPFS
  - Provides health checks and monitoring
- **Usage**: Runs automatically in Docker container

### **⚙️ Configuration Files**

#### **`docker-compose.yml`** - Service Orchestration
- **Purpose**: Define and orchestrate all services
- **What it does**:
- Defines IPFS node (internal-only)
- Sets up nginx reverse proxy (ports 80/443)
- Mounts configs from `./configs` into Nginx
- Manages volumes and networking

#### **`configs/nginx.conf`** - Reverse Proxy Configuration
- **Purpose**: Route traffic and implement security
- **What it does**:
  - Creates IP whitelist mapping
  - Implements rate limiting zones
  - Routes public gateway traffic (read-only)
  - Routes authenticated API traffic (write)
  - Applies security headers

#### **`configs/auth-ips.conf`** - IP Whitelist
- **Purpose**: Define trusted IP addresses
- **What it does**:
  - Lists allowed IPs for nginx mapping
  - Blocks unauthorized access at proxy level
  - Easy to update without service restart
- **Format**: `IP_ADDRESS 1;`

## 🔐 Security Features

- **IP Whitelist**: Only trusted IPs can access write API
- **API Key Authentication**: Secure API access with secret keys
- **Rate Limiting**: Protection against abuse
- **Public Read-Only Gateway**: Safe public access to content
- **Authenticated Write API**: Secure upload and management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Public        │    │   Auth Proxy    │    │   IPFS Node     │
│   Gateway       │    │                 │    │                 │
│                 │    │                 │    │                 │
│ ipfs.peaq.xyz   │    │ api.ipfs.peaq   │    │ Internal IPFS   │
│ (Read-Only)     │◄───┤ .xyz (Write)    │◄───┤ Node            │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Complete Workflow

### **Phase 1: Initial Setup**
```bash
# 1. Configure environment
cp .env.example .env
nano .env                    # Set API_KEY and ALLOWED_IPS

# 2. Set trusted IPs
nano configs/auth-ips.conf   # Add your IPs: 192.168.1.100 1;

# 3. Deploy infrastructure
./deploy.sh                  # Runs docker-compose.yml
```

### **Phase 2: Asset Management**
```bash
# 4. Upload token assets
API_KEY=your-key npm run upload-assets    # Uses ipfs-setup.js

# 5. Verify uploads
curl https://ipfs.peaq.xyz/ipfs/QmYourHash
```

### **Phase 3: Production Operations**
```bash
# 6. Monitor services
docker-compose logs -f

# 7. Add new IPs
echo "192.168.1.200 1;" >> configs/auth-ips.conf
docker-compose restart nginx

# 8. Update assets
API_KEY=your-key npm run upload-assets
```

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit configuration
nano .env
```

### 2. Set Trusted IPs

```bash
# Edit IP whitelist
nano auth-ips.conf

# Add your trusted IPs:
# 192.168.1.100 1;
# 10.0.0.50 1;
# 203.0.113.42 1;
```

### 3. Deploy Services

```bash
# Deploy authenticated IPFS
./deploy.sh
```

### 4. Upload Assets

```bash
# Upload with authentication
API_KEY=your-secret-key npm run upload-assets
```

## 🔄 Script Interaction Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User          │    │   Scripts       │    │   Services      │
│                 │    │                 │    │                 │
│ 1. ./deploy.sh  │───►│ docker-compose  │───►│ IPFS + Auth     │
│                 │    │                 │    │                 │
│ 2. API_KEY=...  │───►│ upload-assets.js│───►│ Auth Proxy      │
│    npm run...   │    │                 │    │                 │
│                 │    │                 │    │                 │
│ 3. curl test    │───►│ ipfs-setup.js   │───►│ IPFS Node       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Script Dependencies**

| **Script** | **Depends On** | **Creates/Manages** |
|------------|----------------|---------------------|
| `deploy.sh` | Docker, .env | All services |
| `upload-assets.js` | `ipfs-setup.js`, API_KEY | Asset uploads |
| `ipfs-setup.js` | Auth Proxy, IPFS | IPFS content |
| `auth-proxy/server.js` | IPFS node | Authentication |
| `nginx.conf` | All services | Traffic routing |

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Allowed IPs for API access
ALLOWED_IPS=127.0.0.1,::1,192.168.1.100,10.0.0.50

# API Key for authentication
API_KEY=your-secret-api-key-here

# Allowed origins for CORS
ALLOWED_ORIGINS=https://ipfs.peaq.xyz,https://tokenlist.peaq.xyz
```

### IP Whitelist (auth-ips.conf)

```nginx
# Add your trusted IPs here
192.168.1.100 1;
10.0.0.50 1;
203.0.113.42 1;
```

## 📋 API Endpoints

### Public Gateway (Read-Only)
- **URL**: `https://ipfs.peaq.xyz`
- **Access**: Public (no authentication)
- **Purpose**: View and download content
- **Rate Limit**: 10 requests/second

### Authenticated API (Write Access)
- **URL**: `https://api-ipfs.peaq.xyz`
- **Access**: IP whitelist + API key
- **Purpose**: Upload and manage content
- **Rate Limit**: 5 requests/second

### API Endpoints

#### Health Check
```bash
curl https://api-ipfs.peaq.xyz/health
```

#### Upload File
```bash
curl -X POST \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"file": "base64-encoded-file", "pin": true}' \
  https://api-ipfs.peaq.xyz/upload
```

#### Pin Content
```bash
curl -X POST \
  -H "X-API-Key: your-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"hash": "QmYourHash"}' \
  https://api-ipfs.peaq.xyz/pin
```

#### Get Content Info
```bash
curl https://api-ipfs.peaq.xyz/info/QmYourHash
```

## 🔒 Security Features

### IP Whitelist
- **Nginx Level**: Blocks unauthorized IPs
- **Application Level**: Double-check in auth proxy
- **Configurable**: Easy to add/remove IPs

### API Key Authentication
- **Secret Key**: Required for all write operations
- **Header Based**: `X-API-Key: your-secret-key`
- **Environment Variable**: `API_KEY=your-secret-key`

### Rate Limiting
- **Public Gateway**: 10 requests/second
- **Authenticated API**: 5 requests/second
- **Per IP**: Individual rate limits

### CORS Protection
- **Whitelist Origins**: Only allowed domains
- **Credentials**: Secure cookie handling
- **Headers**: Security headers on all responses

## 🛠️ Usage Examples

### Upload Token Logo
```bash
# Set API key
export API_KEY=your-secret-key

# Upload logo
node -e "
const fs = require('fs');
const file = fs.readFileSync('logo.svg', 'base64');
fetch('https://api-ipfs.peaq.xyz/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({file, pin: true})
}).then(r => r.json()).then(console.log);
"
```

### Access Uploaded Content
```bash
# Get content via public gateway
curl https://ipfs.peaq.xyz/ipfs/QmYourHash

# Get content info
curl https://api-ipfs.peaq.xyz/info/QmYourHash
```

## 🔍 Monitoring

### Health Checks
```bash
# Check IPFS status
curl https://api-ipfs.peaq.xyz/health

# Check public gateway
curl https://ipfs.peaq.xyz/ipfs/QmYourHash
```

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs ipfs-auth
docker-compose logs ipfs
```

## 🆘 Troubleshooting

### Authentication Issues
```bash
# Check API key
echo $API_KEY

# Test authentication
curl -H "X-API-Key: $API_KEY" https://api-ipfs.peaq.xyz/health
```

### IP Whitelist Issues
```bash
# Check your IP
curl ifconfig.me

# Add IP to whitelist
echo "YOUR_IP 1;" >> auth-ips.conf
docker-compose restart nginx
```

### Rate Limiting
```bash
# Check rate limit status
curl -I https://api-ipfs.peaq.xyz/health

# Wait and retry if rate limited
```

## 📊 Performance

### Resource Requirements
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: 100GB+ for IPFS data
- **CPU**: 2+ cores for content serving
- **Network**: High bandwidth for content delivery

### Optimization
- **Caching**: Nginx caching for frequently accessed content
- **Compression**: Gzip compression for text content
- **CDN**: Consider CDN for global content delivery

## 🎯 Production Deployment

### 1. DNS Configuration
```
ipfs.peaq.xyz → IPFS_VM_IP
api-ipfs.peaq.xyz → IPFS_VM_IP
```

### 2. SSL Certificates
```bash
sudo certbot certonly --standalone -d ipfs.peaq.xyz -d api-ipfs.peaq.xyz
```

### 3. Security Hardening
- Update IP whitelist
- Change default API key
- Configure firewall rules
- Set up monitoring

## 🎉 Success!

Your authenticated IPFS gateway provides:
- ✅ **Secure Upload**: Only trusted IPs can upload
- ✅ **Public Access**: Safe public content viewing
- ✅ **Rate Protection**: Protection against abuse
- ✅ **API Authentication**: Secure API access
- ✅ **Production Ready**: Scalable and monitored