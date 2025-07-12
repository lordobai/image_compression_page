import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
} 