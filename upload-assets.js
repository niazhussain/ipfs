const { uploadTokenAssets } = require('./ipfs-setup');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🎯 peaq IPFS Asset Uploader');
  console.log('============================\n');
  
  try {
    // Upload assets to IPFS
    const uploadResults = await uploadTokenAssets();
    
    // Save upload results for token list to use
    const resultsPath = path.join(__dirname, 'upload-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(uploadResults, null, 2));
    
    console.log('\n✅ Assets uploaded to IPFS!');
    console.log('📄 Upload results saved to upload-results.json');
    
    // Display results
    console.log('\n📋 Upload Results:');
    console.log(JSON.stringify(uploadResults, null, 2));
    
    console.log('\n🌐 Access your assets at:');
    console.log(`  https://ipfs.peaq.xyz/ipfs/{hash}`);
    console.log(`  https://ipfs.io/ipfs/{hash}`);
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
