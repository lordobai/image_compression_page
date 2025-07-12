require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Environment validation
const validateEnvironment = () => {
  const required = [
    'STRIPE_SECRET_KEY',
    'REACT_APP_STRIPE_PRO_PRICE_ID',
    'REACT_APP_STRIPE_ENTERPRISE_PRICE_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  console.log('✅ Environment validation passed');
};

validateEnvironment();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] // Use environment variable
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
    next();
  });
}

// Serve static files from the React app build directory
// In production, this will serve the built React app
const staticPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'build')
  : path.join(__dirname, 'build'); // For now, always use build

app.use(express.static(staticPath, {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: true
}));

// In-memory storage for demo purposes (in production, use a database)
const userSubscriptions = new Map();

// Simple rate limiting (in production, use a proper rate limiter like express-rate-limit)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 100; // max requests per window

const rateLimit = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({ 
      error: 'Too many requests, please try again later' 
    });
  }
  
  recentRequests.push(now);
  requestCounts.set(ip, recentRequests);
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint for development
if (process.env.NODE_ENV === 'development') {
  app.get('/api/test', (req, res) => {
    res.json({ 
      message: 'Test endpoint working!',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  });
}

// Create checkout session (returns checkout URL)
app.post('/api/create-checkout-session', rateLimit, async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = req.body;

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: priceId, successUrl, cancelUrl' 
      });
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      return res.status(400).json({ 
        error: 'Invalid price ID format' 
      });
    }

    console.log(`Creating checkout session for price: ${priceId.substring(0, 8)}...`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      metadata: {
        product: 'image-compression-pro',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ Checkout session created: ${session.id.substring(0, 8)}...`);
    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error.message);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check subscription status
app.post('/api/check-subscription', rateLimit, async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Check if user has a subscription in our storage
    const subscription = userSubscriptions.get(userId);
    
    if (subscription && subscription.isActive) {
      res.json(subscription);
    } else {
      res.json({ isActive: false, tier: 'free' });
    }
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment session and activate subscription
app.post('/api/verify-session', rateLimit, async (req, res) => {
  try {
    const { sessionId, userId } = req.body;
    
    // Validate required fields
    if (!sessionId || !userId) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, userId' 
      });
    }

    console.log(`Verifying session: ${sessionId.substring(0, 8)}... for user: ${userId.substring(0, 8)}...`);
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Determine subscription tier based on price ID
      let tier = 'free';
      const priceId = session.line_items?.data?.[0]?.price?.id;
      
      if (priceId === process.env.REACT_APP_STRIPE_PRO_PRICE_ID) {
        tier = 'pro';
      } else if (priceId === process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID) {
        tier = 'enterprise';
      }
      
      // Store subscription in our storage
      const subscription = {
        isActive: true,
        tier,
        customerId: session.customer,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        sessionId,
        activatedAt: new Date().toISOString(),
        priceId
      };
      
      userSubscriptions.set(userId, subscription);
      
      console.log(`✅ Subscription activated for user ${userId.substring(0, 8)}... - Tier: ${tier}`);
      res.json(subscription);
    } else {
      console.log(`❌ Payment not completed for session: ${sessionId.substring(0, 8)}...`);
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('❌ Error verifying session:', error.message);
    res.status(500).json({ 
      error: 'Failed to verify payment session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test endpoint to clear subscription (for testing purposes)
app.post('/api/clear-subscription', rateLimit, (req, res) => {
  try {
    const { userId } = req.body;
    userSubscriptions.delete(userId);
    res.json({ message: 'Subscription cleared successfully' });
  } catch (error) {
    console.error('Error clearing subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // In production, serve the built React app
  const indexPath = path.join(__dirname, 'build', 'index.html');
  
  // Check if the file exists (for development)
  if (process.env.NODE_ENV === 'development' && !require('fs').existsSync(indexPath)) {
    return res.status(404).json({ 
      error: 'React app not built. Run "npm run build" first.',
      development: true
    });
  }
  
  res.sendFile(indexPath);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ImageCompress Pro Server Started');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💳 Stripe integration: ✅ Configured`);
  console.log(`🔐 Price IDs: ✅ Configured`);
  console.log('✨ Ready to process payments and subscriptions!');
  console.log(`🌐 React app: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
}); 