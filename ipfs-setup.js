const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

// IPFS configuration
const IPFS_CONFIG = {
  // Use local IPFS node (will be set up at ipfs.peaq.xyz)
  host: 'localhost',
  port: 5001,
  protocol: 'http'
};

// Alternative: Use public IPFS gateway for initial setup
const IPFS_PUBLIC = {
  host: 'ipfs.io',
  port: 443,
  protocol: 'https'
};

class IPFSUploader {
  constructor() {
    this.ipfs = create(IPFS_CONFIG);
  }

  async uploadFile(filePath, fileName) {
    try {
      const file = fs.readFileSync(filePath);
      const result = await this.ipfs.add(file);
      
      console.log(`✅ Uploaded ${fileName}: ${result.path}`);
      return result.path;
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
      return null;
    }
  }

  async uploadDirectory(dirPath) {
    const results = {};
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isFile()) {
        const hash = await this.uploadFile(filePath, file);
        if (hash) {
          results[file] = hash;
        }
      }
    }
    
    return results;
  }

  async pinFile(hash) {
    try {
      await this.ipfs.pin.add(hash);
      console.log(`📌 Pinned ${hash}`);
    } catch (error) {
      console.error(`❌ Failed to pin ${hash}:`, error.message);
    }
  }
}

// Upload script
async function uploadTokenAssets() {
  const uploader = new IPFSUploader();
  
  // Path to existing token assets
  const assetsPath = path.join(__dirname, '../peaq-dex/public/icons');
  
  console.log('🚀 Starting IPFS upload...');
  console.log(`📁 Uploading assets from: ${assetsPath}`);
  
  const results = await uploader.uploadDirectory(assetsPath);
  
  console.log('\n📋 Upload Results:');
  console.log(JSON.stringify(results, null, 2));
  
  // Pin important files
  const importantFiles = ['peaq-logo.svg', 'tokens/ethereum.svg', 'tokens/usdc.svg', 'tokens/usdt.svg'];
  for (const file of importantFiles) {
    if (results[file]) {
      await uploader.pinFile(results[file]);
    }
  }
  
  return results;
}

if (require.main === module) {
  uploadTokenAssets().catch(console.error);
}

module.exports = { IPFSUploader, uploadTokenAssets };
