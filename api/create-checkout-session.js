import Stripe from 'stripe';

// Validate environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log request details
  console.log('=== CHECKOUT SESSION REQUEST ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Stripe key exists:', !!process.env.STRIPE_SECRET_KEY);

  try {
    const { priceId, successUrl, cancelUrl, customerEmail } = req.body;

    // Validate required fields
    if (!priceId || !successUrl || !cancelUrl) {
      console.error('❌ Missing required fields:', { priceId, successUrl, cancelUrl });
      return res.status(400).json({ 
        error: 'Missing required fields: priceId, successUrl, cancelUrl' 
      });
    }

    // Validate price ID format
    if (!priceId.startsWith('price_')) {
      console.error('❌ Invalid price ID format:', priceId);
      return res.status(400).json({ 
        error: 'Invalid price ID format' 
      });
    }

    // Validate Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is not configured');
      return res.status(500).json({ 
        error: 'Stripe configuration error' 
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
    console.log('Session URL:', session.url);
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
} 