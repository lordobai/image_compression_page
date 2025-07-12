import Stripe from 'stripe';

// Enhanced environment validation
const validateEnvironment = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  
  if (!process.env.REACT_APP_STRIPE_PRO_PRICE_ID || !process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID) {
    throw new Error('Stripe price IDs are not configured');
  }
};

// Initialize Stripe with validation
let stripe;
try {
  validateEnvironment();
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.error('❌ Stripe initialization failed:', error.message);
}

export default async function handler(req, res) {
  // Enhanced CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Enhanced request logging
  console.log('=== CHECKOUT SESSION REQUEST ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('User-Agent:', req.headers['user-agent']);
  console.log('Origin:', req.headers.origin);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Stripe configured:', !!stripe);
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  // Method validation
  if (req.method !== 'POST') {
    console.error('❌ Invalid method:', req.method);
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST'],
      received: req.method
    });
  }

  try {
    // Validate Stripe is configured
    if (!stripe) {
      console.error('❌ Stripe is not configured');
      return res.status(500).json({ 
        error: 'Payment service is not configured',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    const { priceId, successUrl, cancelUrl, customerEmail } = req.body;

    // Enhanced field validation
    const missingFields = [];
    if (!priceId) missingFields.push('priceId');
    if (!successUrl) missingFields.push('successUrl');
    if (!cancelUrl) missingFields.push('cancelUrl');

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      return res.status(400).json({ 
        error: 'Missing required fields',
        missing: missingFields,
        received: { priceId: !!priceId, successUrl: !!successUrl, cancelUrl: !!cancelUrl }
      });
    }

    // Enhanced price ID validation
    if (!priceId.startsWith('price_')) {
      console.error('❌ Invalid price ID format:', priceId);
      return res.status(400).json({ 
        error: 'Invalid price ID format',
        expected: 'price_*',
        received: priceId
      });
    }

    // Validate against known price IDs
    const validPriceIds = [
      process.env.REACT_APP_STRIPE_PRO_PRICE_ID,
      process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID
    ].filter(Boolean);

    if (!validPriceIds.includes(priceId)) {
      console.error('❌ Unknown price ID:', priceId);
      return res.status(400).json({ 
        error: 'Unknown price ID',
        validPriceIds: validPriceIds.map(id => id?.substring(0, 8) + '...'),
        received: priceId
      });
    }

    console.log(`✅ Creating checkout session for price: ${priceId.substring(0, 8)}...`);

    // Create Stripe checkout session
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
        environment: process.env.NODE_ENV || 'production',
      },
    });

    console.log(`✅ Checkout session created successfully`);
    console.log('Session ID:', session.id.substring(0, 8) + '...');
    console.log('Session URL:', session.url);
    console.log('Payment status:', session.payment_status);
    
    res.status(200).json({ 
      url: session.url,
      sessionId: session.id,
      success: true
    });

  } catch (error) {
    console.error('❌ Error creating checkout session:');
    console.error('Error message:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Error stack:', error.stack);
    
    // Enhanced error response
    const errorResponse = {
      error: 'Failed to create checkout session',
      code: 'CHECKOUT_SESSION_ERROR',
      timestamp: new Date().toISOString()
    };

    // Add debug info in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
} 