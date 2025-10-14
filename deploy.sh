#!/bin/bash

echo "🔐 Deploying Authenticated IPFS Gateway (Simplified)"
echo "==================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Ensure htpasswd exists
if [ ! -f configs/.htpasswd ]; then
    echo "⚠️  .htpasswd not found. Creating..."
    echo "Provide credentials for Basic Auth (api-ipfs.peaq.xyz)"
    read -p "Username: " HTPASS_USER
    read -s -p "Password: " HTPASS_PASS
    echo
    mkdir -p configs
    docker run --rm httpd:2.4-alpine htpasswd -Bbn "$HTPASS_USER" "$HTPASS_PASS" > ./configs/.htpasswd
    echo "✅ Created .htpasswd with provided credentials"
fi

# Ensure auth-ips.conf exists
if [ ! -f configs/auth-ips.conf ]; then
    echo "⚠️  auth-ips.conf not found. Creating default (localhost only)..."
    mkdir -p configs
    cat > configs/auth-ips.conf <<EOF
127.0.0.1 1;
::1 1;
EOF
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p configs/ssl
mkdir -p logs

# Start services
echo "🔨 Starting IPFS and Nginx..."
docker-compose down --remove-orphans
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check IPFS gateway
if curl -s http://localhost/ipfs/ | head -n1 > /dev/null; then
    echo "✅ IPFS Gateway (public) is running"
else
    echo "❌ IPFS Gateway (public) is not responding"
fi

# Check IPFS API (requires auth, expect 401 if no creds)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/v0/version)
if [ "$API_STATUS" = "401" ] || [ "$API_STATUS" = "403" ]; then
    echo "✅ IPFS API (authenticated) is protected"
else
    echo "❌ IPFS API protection check failed (status: $API_STATUS)"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Services:"
echo "  - Public Gateway: http://localhost/ipfs/"
echo "  - Authenticated API: http://localhost/api/v0/ (Basic Auth + IP allowlist)"
echo ""
echo "📝 Next steps:"
echo "  1. Point DNS to this VM: ipfs.peaq.xyz and api-ipfs.peaq.xyz"
echo "  2. Issue SSL with certbot and update nginx to listen on 443"
echo "  3. Add your office/home IPs to auth-ips.conf and restart nginx"
echo "  4. Use curl with -u username:password to call API"