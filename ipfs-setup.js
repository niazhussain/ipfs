const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');

// IPFS configuration with authentication
const IPFS_CONFIG = {
  host: 'localhost',
  port: 5002, // Authenticated API port
  protocol: 'http',
  headers: {
    'X-API-Key': process.env.API_KEY || 'your-secret-api-key'
  }
};

class AuthenticatedIPFSUploader {
  constructor() {
    this.ipfs = create(IPFS_CONFIG);
    this.uploadResults = {};
  }

  async uploadFile(filePath, fileName) {
    try {
      console.log(`📤 Uploading ${fileName}...`);
      
      const file = fs.readFileSync(filePath);
      const result = await this.ipfs.add(file);
      
      console.log(`✅ Uploaded ${fileName}: ${result.path}`);
      this.uploadResults[fileName] = result.path;
      
      return result.path;
    } catch (error) {
      console.error(`❌ Failed to upload ${fileName}:`, error.message);
      return null;
    }
  }

  async uploadDirectory(dirPath) {
    const results = {};
    const files = fs.readdirSync(dirPath);
    
    console.log(`📁 Processing directory: ${dirPath}`);
    console.log(`📋 Found ${files.length} files`);
    
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
      console.log(`📌 Pinning ${hash}...`);
      await this.ipfs.pin.add(hash);
      console.log(`✅ Pinned ${hash}`);
    } catch (error) {
      console.error(`❌ Failed to pin ${hash}:`, error.message);
    }
  }

  async pinImportantFiles(results) {
    const importantFiles = [
      'peaq-logo.svg', 
      'tokens/ethereum.svg', 
      'tokens/usdc.svg', 
      'tokens/usdt.svg'
    ];
    
    console.log('📌 Pinning important files...');
    
    for (const file of importantFiles) {
      if (results[file]) {
        await this.pinFile(results[file]);
      }
    }
  }

  async saveResults(results) {
    const resultsPath = path.join(__dirname, 'upload-results.json');
    const timestamp = new Date().toISOString();
    
    const output = {
      timestamp,
      totalFiles: Object.keys(results).length,
      results,
      gateway: 'https://ipfs.peaq.xyz',
      api: 'https://api-ipfs.peaq.xyz'
    };
    
    fs.writeFileSync(resultsPath, JSON.stringify(output, null, 2));
    console.log(`💾 Results saved to: ${resultsPath}`);
    
    return output;
  }
}

// Upload script with authentication
async function uploadTokenAssets() {
  console.log('🔐 Authenticated IPFS Asset Uploader');
  console.log('=====================================\n');
  
  // Check API key
  if (!process.env.API_KEY || process.env.API_KEY === 'your-secret-api-key') {
    console.error('❌ API_KEY not set. Please set API_KEY environment variable.');
    console.log('💡 Example: API_KEY=your-secret-key node ipfs-setup.js');
    process.exit(1);
  }
  
  const uploader = new AuthenticatedIPFSUploader();
  
  try {
    // Test connection
    console.log('🔍 Testing IPFS connection...');
    const version = await uploader.ipfs.version();
    console.log(`✅ Connected to IPFS v${version.version}\n`);
    
    // Path to existing token assets
    const assetsPath = path.join(__dirname, '../peaq-dex/public/icons');
    
    if (!fs.existsSync(assetsPath)) {
      console.error(`❌ Assets directory not found: ${assetsPath}`);
      console.log('💡 Make sure peaq-dex project is in the parent directory');
      process.exit(1);
    }
    
    console.log('🚀 Starting authenticated IPFS upload...');
    console.log(`📁 Uploading assets from: ${assetsPath}`);
    console.log(`🔑 Using API key: ${process.env.API_KEY.substring(0, 8)}...\n`);
    
    const results = await uploader.uploadDirectory(assetsPath);
    
    console.log('\n📋 Upload Results:');
    console.log(JSON.stringify(results, null, 2));
    
    // Pin important files
    await uploader.pinImportantFiles(results);
    
    // Save results
    const output = await uploader.saveResults(results);
    
    console.log('\n🎉 Upload complete!');
    console.log(`📊 Total files uploaded: ${output.totalFiles}`);
    console.log(`🌐 Gateway: ${output.gateway}`);
    console.log(`🔐 API: ${output.api}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    
    if (error.message.includes('403')) {
      console.log('💡 Check your IP address is whitelisted');
    } else if (error.message.includes('401')) {
      console.log('💡 Check your API key is correct');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  uploadTokenAssets().catch(console.error);
}

module.exports = { AuthenticatedIPFSUploader, uploadTokenAssets };