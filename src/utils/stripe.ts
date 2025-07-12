// Environment validation
const validateEnvironment = () => {
  const required = [
    'REACT_APP_STRIPE_PRO_PRICE_ID',
    'REACT_APP_STRIPE_ENTERPRISE_PRICE_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Validate environment on module load
validateEnvironment();

// API endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;

export interface CreateCheckoutSessionParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface SubscriptionStatus {
  isActive: boolean;
  tier: 'free' | 'pro' | 'enterprise';
  expiresAt?: string;
  customerId?: string;
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

// Check user's subscription status
export const checkSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/check-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to check subscription status');
    }

    const status = await response.json();
    return status;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    // Return free tier as fallback
    return { isActive: false, tier: 'free' };
  }
};

// Verify session and activate subscription
export const verifyPaymentSession = async (sessionId: string, userId: string): Promise<SubscriptionStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment session');
    }

    const status = await response.json();
    return status;
  } catch (error) {
    console.error('Error verifying payment session:', error);
    throw error;
  }
};

// Clear subscription (for testing purposes)
export const clearSubscription = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clear-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to clear subscription');
    }

    // Also clear from localStorage (user-specific and fallback)
    localStorage.removeItem(`subscription_${userId}`);
    localStorage.removeItem('subscription'); // Fallback for old format
  } catch (error) {
    console.error('Error clearing subscription:', error);
    throw error;
  }
};

// Product/Price IDs for your subscription tiers
export const STRIPE_PRICE_IDS = {
  pro: process.env.REACT_APP_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  enterprise: process.env.REACT_APP_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
}; 