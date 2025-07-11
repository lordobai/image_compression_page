// API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

// Create a checkout session for subscription (returns checkout URL)
export const createCheckoutSession = async (params: CreateCheckoutSessionParams): Promise<{ url: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const session = await response.json();
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Product/Price IDs for your subscription tiers
export const STRIPE_PRICE_IDS = {
  pro: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
}; 