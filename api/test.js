export default function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== API TEST ENDPOINT ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);

  // Environment validation
  const environment = {
    NODE_ENV: process.env.NODE_ENV || 'production',
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    REACT_APP_STRIPE_PRO_PRICE_ID: !!process.env.REACT_APP_STRIPE_PRO_PRICE_ID,
    REACT_APP_STRIPE_ENTERPRISE_PRICE_ID: !!process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID,
    REACT_APP_CLERK_PUBLISHABLE_KEY: !!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY,
  };

  console.log('Environment check:', environment);

  // Check for missing critical environment variables
  const missingVars = [];
  if (!process.env.STRIPE_SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
  if (!process.env.REACT_APP_STRIPE_PRO_PRICE_ID) missingVars.push('REACT_APP_STRIPE_PRO_PRICE_ID');
  if (!process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID) missingVars.push('REACT_APP_STRIPE_ENTERPRISE_PRICE_ID');

  const status = missingVars.length === 0 ? 'healthy' : 'warning';

  res.status(200).json({ 
    message: 'API is working!',
    status: status,
    timestamp: new Date().toISOString(),
    environment: environment,
    missingVariables: missingVars,
    endpoints: {
      test: '/api/test',
      health: '/api/health',
      createCheckout: '/api/create-checkout-session',
      checkSubscription: '/api/check-subscription',
      verifySession: '/api/verify-session',
      clearSubscription: '/api/clear-subscription'
    },
    version: '2.0.0'
  });
} 