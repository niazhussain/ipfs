const { uploadTokenAssets } = require('./ipfs-setup');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🔐 Authenticated IPFS Asset Uploader');
  console.log('=====================================\n');
  
  // Check environment variables
  if (!process.env.API_KEY) {
    console.error('❌ API_KEY environment variable not set');
    console.log('💡 Set API_KEY=your-secret-key before running');
    console.log('💡 Or create a .env file with API_KEY=your-secret-key');
    process.exit(1);
  }
  
  try {
    // Upload assets to IPFS with authentication
    const uploadResults = await uploadTokenAssets();
    
    console.log('\n✅ Assets uploaded to IPFS!');
    console.log('📄 Upload results saved to upload-results.json');
    
    // Display access URLs
    console.log('\n🌐 Access your assets at:');
    console.log(`  Public Gateway: https://ipfs.peaq.xyz/ipfs/{hash}`);
    console.log(`  Authenticated API: https://api-ipfs.peaq.xyz/`);
    
    // Show example usage
    console.log('\n📝 Example usage:');
    console.log('  curl -H "X-API-Key: your-secret-key" https://api-ipfs.peaq.xyz/health');
    console.log('  curl https://ipfs.peaq.xyz/ipfs/QmYourHash');
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}