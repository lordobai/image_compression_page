import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Sparkles, ArrowRight, Crown, Loader } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { verifyPaymentSession, SubscriptionStatus } from '../utils/stripe';
import { toast } from 'react-hot-toast';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useUser();
  const [isVerifying, setIsVerifying] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        console.log('PaymentSuccess: URL params:', Object.fromEntries(searchParams.entries()));
        console.log('PaymentSuccess: Session ID:', sessionId);
        console.log('PaymentSuccess: User:', user?.id);
        console.log('PaymentSuccess: NODE_ENV:', process.env.NODE_ENV);
        console.log('PaymentSuccess: Is test mode?', process.env.NODE_ENV === 'development' && sessionId === 'test123');
        
        // Test mode for development - check multiple conditions
        const isDevelopment = process.env.NODE_ENV === 'development' || 
                             process.env.REACT_APP_ENABLE_TEST_MODE === 'true' ||
                             window.location.hostname === 'localhost';
        
        // Helper function to store subscription with user-specific key
        const storeSubscription = (subscription: SubscriptionStatus) => {
          if (user) {
            const userSubscriptionKey = `subscription_${user.id}`;
            localStorage.setItem(userSubscriptionKey, JSON.stringify(subscription));
          } else {
            // Fallback for test mode without user
            localStorage.setItem('subscription', JSON.stringify(subscription));
          }
        };
        
        if (isDevelopment && sessionId === 'test123') {
          console.log('PaymentSuccess: Using test mode (test123)');
          const testSubscription: SubscriptionStatus = {
            isActive: true,
            tier: 'pro',
            customerId: 'cus_test123',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          setSubscription(testSubscription);
          storeSubscription(testSubscription);
          toast.success('Test subscription activated successfully!');
          setIsVerifying(false);
          return;
        }

        // Additional test mode for any test session ID
        if (isDevelopment && sessionId && sessionId.startsWith('test')) {
          console.log('PaymentSuccess: Using extended test mode (starts with test)');
          const testSubscription: SubscriptionStatus = {
            isActive: true,
            tier: 'pro',
            customerId: 'cus_test123',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          setSubscription(testSubscription);
          storeSubscription(testSubscription);
          toast.success('Test subscription activated successfully!');
          setIsVerifying(false);
          return;
        }
        
        if (!sessionId) {
          console.error('PaymentSuccess: Missing session_id');
          toast.error('Invalid payment session');
          navigate('/');
          return;
        }

        // Development test mode - bypass real verification for any session ID
        if (isDevelopment) {
          console.log('PaymentSuccess: Development mode - creating test subscription for any session ID');
          const testSubscription: SubscriptionStatus = {
            isActive: true,
            tier: 'pro',
            customerId: 'cus_test123',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          setSubscription(testSubscription);
          storeSubscription(testSubscription);
          toast.success('Development test subscription activated successfully!');
          setIsVerifying(false);
          return;
        }

        if (!user) {
          console.error('PaymentSuccess: User not authenticated');
          toast.error('Please sign in to complete your subscription');
          navigate('/');
          return;
        }

        // Verify the payment session with our backend
        const subscriptionStatus = await verifyPaymentSession(sessionId, user.id);
        setSubscription(subscriptionStatus);
        
        // Store subscription status in localStorage for persistence
        storeSubscription(subscriptionStatus);
        
        toast.success('Subscription activated successfully!');
      } catch (error) {
        console.error('PaymentSuccess: Error verifying payment:', error);
        toast.error('Failed to verify payment. Please contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, user, navigate]);

  const handleContinue = () => {
    navigate('/');
  };

  const handleDownload = () => {
    // Trigger download of any files or redirect to app
    navigate('/');
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel rounded-3xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 gradient-bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Loader className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">Verifying Payment</h2>
          <p className="text-neutral-300">Please wait while we activate your subscription...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-panel rounded-3xl p-8 max-w-2xl w-full"
      >
        {/* Success Animation */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
            className="w-20 h-20 gradient-bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-4xl font-bold gradient-text-primary mb-4">
              Payment Successful!
            </h1>
            <p className="text-xl text-neutral-300">
              Welcome to your {subscription?.tier === 'enterprise' ? 'Enterprise' : 'Pro'} subscription
            </p>
          </motion.div>
        </div>

        {/* Subscription Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-medium rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 gradient-bg-accent rounded-xl flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Subscription Activated</h3>
              <p className="text-neutral-400 text-sm">Your premium features are now available</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 glass-light rounded-xl">
              <span className="text-neutral-400 text-sm">Status</span>
              <p className="text-emerald-400 font-semibold">Active</p>
            </div>
            <div className="p-4 glass-light rounded-xl">
              <span className="text-neutral-400 text-sm">Plan</span>
              <p className="text-white font-semibold capitalize">{subscription?.tier || 'Pro'}</p>
            </div>
          </div>
        </motion.div>

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-light rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
            What's Next?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 gradient-bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <span className="text-neutral-300">
                Upload larger files (up to {subscription?.tier === 'enterprise' ? '100MB' : '50MB'})
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 gradient-bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-neutral-300">
                Process up to {subscription?.tier === 'enterprise' ? '1000' : '50'} images at once
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 gradient-bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-neutral-300">Access advanced compression options</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Start Compressing</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="btn-secondary flex items-center justify-center"
          >
            Continue to App
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-center text-sm text-neutral-400"
        >
          <p>
            You'll receive a confirmation email shortly. 
            If you have any questions, please contact our support team.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}; 