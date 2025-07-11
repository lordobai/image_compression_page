import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Crown, Shield, Sparkles, ArrowRight, Lock, User } from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { PricingTier } from '../types';
import { createCheckoutSession, STRIPE_PRICE_IDS } from '../utils/stripe';
import { toast } from 'react-hot-toast';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (tierId: string) => void;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'pro',
    name: 'Pro',
    price: 7.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Batch upload (up to 50 images)',
      'Larger file sizes (up to 50MB)',
      'Advanced compression options',
      'Priority processing',
      'Ad-free experience',
      'Download as ZIP',
      'Custom quality presets',
      '24/7 support'
    ],
    limits: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxFilesPerBatch: 50,
      maxImagesPerMonth: 1000,
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited batch uploads',
      'Maximum file sizes (up to 100MB)',
      'API access',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'Usage analytics'
    ],
    limits: {
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFilesPerBatch: 1000,
      maxImagesPerMonth: 10000,
    }
  }
];

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSubscribe,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (tier: PricingTier) => {
    setIsLoading(true);
    
    try {
      const priceId = STRIPE_PRICE_IDS[tier.id as keyof typeof STRIPE_PRICE_IDS];
      if (!priceId) {
        throw new Error('Invalid subscription tier');
      }

      const session = await createCheckoutSession({
        priceId,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cancel`,
        customerEmail: undefined, // Will be collected by Stripe
      });

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-panel rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-radial animate-float opacity-20"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-gradient-mesh animate-float opacity-15" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Header */}
            <div className="relative p-8 border-b border-white/[0.1]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 gradient-bg-primary rounded-2xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                <div>
                    <h2 className="text-3xl font-bold gradient-text-primary">
                      Upgrade to Pro
                    </h2>
                    <p className="text-neutral-300 mt-1">
                      Unlock advanced features and lightning-fast processing
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="glass-button p-3 rounded-xl"
                >
                  <X className="w-5 h-5 text-neutral-300" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-8">
              {/* Authentication Status */}
              <SignedOut>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 p-6 glass-light rounded-2xl border border-orange-500/20"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <User className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-semibold text-white">Sign in to Subscribe</h3>
                  </div>
                  <p className="text-neutral-300 mb-4">
                    You need to create an account to access premium features and manage your subscription.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <SignUpButton mode="modal">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary flex items-center justify-center space-x-2"
                      >
                        <User className="w-4 h-4" />
                        <span>Create Account</span>
                      </motion.button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary flex items-center justify-center space-x-2"
                      >
                        <span>Sign In</span>
                      </motion.button>
                    </SignInButton>
                  </div>
                </motion.div>
              </SignedOut>

            {/* Pricing Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {pricingTiers.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className="card-modern relative"
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {tier.id === 'pro' && (
                      <motion.div 
                        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                      >
                        <span className="gradient-bg-accent text-white text-sm font-bold px-4 py-2 rounded-full flex items-center shadow-lg">
                          <Star className="w-4 h-4 mr-2" />
                          Most Popular
                        </span>
                      </motion.div>
                    )}

                    <div className="text-center mb-8">
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                        {tier.id === 'pro' && (
                          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                        )}
                      </div>
                      <div className="mb-4">
                        <span className="text-4xl font-black gradient-text-primary">${tier.price}</span>
                        <span className="text-neutral-400 ml-2">/{tier.interval}</span>
                      </div>
                      <p className="text-neutral-300 text-sm">
                        Perfect for {tier.id === 'pro' ? 'professionals and growing teams' : 'large organizations'}
                      </p>
                    </div>

                    <div className="space-y-4 mb-8">
                      {tier.features.map((feature, featureIndex) => (
                        <motion.div 
                          key={featureIndex} 
                          className="flex items-start space-x-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 + featureIndex * 0.1 }}
                        >
                          <div className="w-5 h-5 gradient-bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                          <span className="text-sm text-neutral-300">{feature}</span>
                        </motion.div>
                      ))}
                    </div>

                    <SignedIn>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSubscribe(tier)}
                      disabled={isLoading}
                        className="w-full btn-primary"
                    >
                        <div className="flex items-center justify-center space-x-2">
                      {isLoading ? (
                            <div className="spinner-glow"></div>
                      ) : (
                        <>
                              <Zap className="w-5 h-5" />
                              <span>Get {tier.name}</span>
                              <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                        </div>
                      </motion.button>
                    </SignedIn>
                    <SignedOut>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={true}
                        className="w-full btn-disabled"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <Zap className="w-5 h-5" />
                          <span>Sign in to Subscribe</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </motion.button>
                    </SignedOut>
                  </motion.div>
                ))}
              </div>

              {/* Free Plan Comparison */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-12 p-6 glass-light rounded-2xl border border-neutral-700"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Lock className="w-5 h-5 text-neutral-400" />
                  <h3 className="text-lg font-semibold text-white">Free Plan Limitations</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-300">
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>Single file upload only</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>Max 10MB file size</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>•</span>
                    <span>Basic compression only</span>
                  </div>
                </div>
              </motion.div>

              {/* Security Notice */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="mt-6 text-center"
              >
                <div className="flex items-center justify-center space-x-2 text-neutral-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Secure payment powered by Stripe</span>
              </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 