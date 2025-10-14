#!/bin/bash

echo "🔧 Setting up IPFS Node (Standalone VM)"
echo "========================================"

# Install IPFS if not already installed
if ! command -v ipfs &> /dev/null; then
    echo "📦 Installing IPFS..."
    
    # Download IPFS
    wget https://dist.ipfs.tech/kubo/v0.21.0/kubo_v0.21.0_linux-amd64.tar.gz
    tar -xzf kubo_v0.21.0_linux-amd64.tar.gz
    sudo mv kubo/ipfs /usr/local/bin/
    rm -rf kubo kubo_v0.21.0_linux-amd64.tar.gz
    
    echo "✅ IPFS installed"
else
    echo "✅ IPFS already installed"
fi

# Initialize IPFS if not already initialized
if [ ! -d ~/.ipfs ]; then
    echo "🔧 Initializing IPFS..."
    ipfs init
    echo "✅ IPFS initialized"
else
    echo "✅ IPFS already initialized"
fi

# Configure IPFS for production
echo "⚙️ Configuring IPFS..."

# Enable gateway
ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080

# Enable API
ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001

# Set gateway to be writable (for CORS)
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Methods '["GET", "POST"]'
ipfs config --json Gateway.HTTPHeaders.Access-Control-Allow-Headers '["X-Requested-With"]'

# Start IPFS daemon
echo "🚀 Starting IPFS daemon..."
ipfs daemon &

# Wait for IPFS to start
sleep 5

# Check if IPFS is running
if curl -s http://localhost:5001/api/v0/version > /dev/null; then
    echo "✅ IPFS daemon is running"
    echo "📡 IPFS Gateway: http://localhost:8080"
    echo "🔌 IPFS API: http://localhost:5001"
else
    echo "❌ Failed to start IPFS daemon"
    exit 1
fi

echo ""
echo "🎉 IPFS setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Configure DNS for ipfs.peaq.xyz"
echo "  2. Set up SSL certificates"
echo "  3. Upload token assets: npm run upload-assets"
