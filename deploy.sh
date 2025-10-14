#!/bin/bash

echo "🚀 Deploying peaq IPFS Gateway"
echo "=============================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ssl
mkdir -p logs

# Build and start services
echo "🔨 Building and starting IPFS services..."
docker-compose down --remove-orphans
docker-compose build
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for IPFS to start..."
sleep 15

# Check service health
echo "🔍 Checking IPFS health..."

# Check IPFS
if curl -s http://localhost:5001/api/v0/version > /dev/null; then
    echo "✅ IPFS API is running"
else
    echo "❌ IPFS API is not responding"
fi

# Check IPFS Gateway
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ IPFS Gateway is running"
else
    echo "❌ IPFS Gateway is not responding"
fi

echo ""
echo "🎉 IPFS deployment complete!"
echo ""
echo "📋 Services:"
echo "  - IPFS Gateway: http://localhost:8080"
echo "  - IPFS API: http://localhost:5001"
echo "  - Web UI: http://localhost:8080"
echo ""
echo "🌐 Production URL (when DNS is configured):"
echo "  - IPFS Gateway: https://ipfs.peaq.xyz"
echo ""
echo "📝 Next steps:"
echo "  1. Configure DNS for ipfs.peaq.xyz"
echo "  2. Set up SSL certificates"
echo "  3. Upload token assets: npm run upload-assets"
