import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      
      // For now, return subscription info (you'll need to implement proper database storage)
      const subscription = {
        isActive: true,
        tier,
        customerId: session.customer,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        sessionId,
        activatedAt: new Date().toISOString(),
        priceId
      };
      
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
} 