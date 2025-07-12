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

  console.log('=== API DEBUG ENDPOINT ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  // Comprehensive environment check
  const debugInfo = {
    timestamp: new Date().toISOString(),
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV || 'production',
      VERCEL_ENV: process.env.VERCEL_ENV || 'unknown',
      VERCEL_REGION: process.env.VERCEL_REGION || 'unknown'
    },
    stripe: {
      secretKey: !!process.env.STRIPE_SECRET_KEY,
      proPriceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID ? 
        process.env.REACT_APP_STRIPE_PRO_PRICE_ID.substring(0, 8) + '...' : 'not set',
      enterprisePriceId: process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID ? 
        process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID.substring(0, 8) + '...' : 'not set'
    },
    clerk: {
      publishableKey: !!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };

  // Check for critical issues
  const issues = [];
  if (!process.env.STRIPE_SECRET_KEY) issues.push('STRIPE_SECRET_KEY missing');
  if (!process.env.REACT_APP_STRIPE_PRO_PRICE_ID) issues.push('REACT_APP_STRIPE_PRO_PRICE_ID missing');
  if (!process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID) issues.push('REACT_APP_STRIPE_ENTERPRISE_PRICE_ID missing');
  if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) issues.push('REACT_APP_CLERK_PUBLISHABLE_KEY missing');

  debugInfo.issues = issues;
  debugInfo.status = issues.length === 0 ? 'healthy' : 'has_issues';

  console.log('Debug info:', JSON.stringify(debugInfo, null, 2));

  res.status(200).json(debugInfo);
} 