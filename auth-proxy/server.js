const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { create } = require('ipfs-http-client');

const app = express();
const PORT = process.env.PORT || 5002;

// Configuration
const IPFS_HOST = process.env.IPFS_HOST || 'ipfs';
const IPFS_PORT = process.env.IPFS_PORT || 5001;
const ALLOWED_IPS = (process.env.ALLOWED_IPS || '127.0.0.1,::1').split(',');
const API_KEY = process.env.API_KEY || 'your-secret-api-key';

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'ipfs_auth',
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

// IPFS client
const ipfs = create({
  host: IPFS_HOST,
  port: IPFS_PORT,
  protocol: 'http'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://ipfs.peaq.xyz'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// IP whitelist middleware
const checkIP = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  const forwardedIP = req.headers['x-forwarded-for']?.split(',')[0];
  const realIP = forwardedIP || clientIP;
  
  console.log(`Request from IP: ${realIP}`);
  
  if (ALLOWED_IPS.includes(realIP) || ALLOWED_IPS.includes('*')) {
    return next();
  }
  
  console.log(`Blocked request from unauthorized IP: ${realIP}`);
  return res.status(403).json({ 
    error: 'Access denied', 
    message: 'Your IP address is not authorized to access this service' 
  });
};

// API key middleware
const checkAPIKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (apiKey === API_KEY) {
    return next();
  }
  
  return res.status(401).json({ 
    error: 'Unauthorized', 
    message: 'Valid API key required' 
  });
};

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
  try {
    const clientIP = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(clientIP);
    next();
  } catch (rejRes) {
    return res.status(429).json({
      error: 'Too many requests',
      message: 'Rate limit exceeded. Please try again later.'
    });
  }
};

// Apply security middleware to all routes
app.use(checkIP);
app.use(rateLimitMiddleware);

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'IPFS Auth Proxy'
  });
});

// IPFS API routes (require API key)
app.use('/api/v0', checkAPIKey);

// Proxy IPFS API calls
app.all('/api/v0/*', async (req, res) => {
  try {
    const path = req.path.replace('/api/v0', '');
    const method = req.method.toLowerCase();
    
    console.log(`Proxying ${method.toUpperCase()} ${path}`);
    
    // Handle different IPFS API methods
    if (method === 'post' && path === '/add') {
      // Handle file upload
      const result = await ipfs.add(req.body);
      return res.json(result);
    } else if (method === 'post' && path === '/pin/add') {
      // Handle pinning
      const { arg } = req.body;
      const result = await ipfs.pin.add(arg);
      return res.json(result);
    } else if (method === 'get' && path === '/version') {
      // Handle version check
      const result = await ipfs.version();
      return res.json(result);
    } else if (method === 'get' && path === '/id') {
      // Handle ID check
      const result = await ipfs.id();
      return res.json(result);
    } else {
      // Generic proxy for other endpoints
      return res.status(501).json({ 
        error: 'Not implemented', 
        message: `Method ${method} for path ${path} not implemented` 
      });
    }
  } catch (error) {
    console.error('IPFS API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// File upload endpoint
app.post('/upload', checkAPIKey, async (req, res) => {
  try {
    const { file, pin = true } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    console.log('Uploading file to IPFS...');
    const result = await ipfs.add(file);
    
    if (pin) {
      console.log('Pinning file...');
      await ipfs.pin.add(result.path);
    }
    
    res.json({
      success: true,
      hash: result.path,
      size: result.size,
      pinned: pin
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message 
    });
  }
});

// Pin content endpoint
app.post('/pin', checkAPIKey, async (req, res) => {
  try {
    const { hash } = req.body;
    
    if (!hash) {
      return res.status(400).json({ error: 'No hash provided' });
    }
    
    console.log(`Pinning content: ${hash}`);
    const result = await ipfs.pin.add(hash);
    
    res.json({
      success: true,
      hash: hash,
      pinned: true
    });
  } catch (error) {
    console.error('Pin Error:', error);
    res.status(500).json({ 
      error: 'Pin failed', 
      message: error.message 
    });
  }
});

// Get content info
app.get('/info/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    console.log(`Getting info for: ${hash}`);
    const stats = await ipfs.files.stat(`/ipfs/${hash}`);
    
    res.json({
      hash: hash,
      size: stats.size,
      type: stats.type
    });
  } catch (error) {
    console.error('Info Error:', error);
    res.status(500).json({ 
      error: 'Info failed', 
      message: error.message 
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: 'An unexpected error occurred' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔐 IPFS Auth Proxy running on port ${PORT}`);
  console.log(`🌐 Allowed IPs: ${ALLOWED_IPS.join(', ')}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 8)}...`);
  console.log(`📡 IPFS Host: ${IPFS_HOST}:${IPFS_PORT}`);
});
