import React from 'react';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate('/');
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleSupport = () => {
    // Open support chat or email
    window.open('mailto:support@yourdomain.com', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-radial flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="glass-panel rounded-3xl p-8 max-w-2xl w-full text-center"
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 300 }}
          className="w-20 h-20 status-error rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <XCircle className="w-10 h-10 text-red-400" />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-neutral-300 mb-6">
            No worries! You can try again anytime
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-medium rounded-2xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            What happened?
          </h3>
          <div className="space-y-3 text-left">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-neutral-300 text-sm">
                You cancelled the payment process before completion
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-neutral-300 text-sm">
                No charges were made to your account
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-neutral-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-neutral-300 text-sm">
                You can still use the free version of our app
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="flex-1 btn-primary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBack}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to App</span>
          </motion.button>
        </motion.div>

        {/* Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <p className="text-sm text-neutral-500 mb-4">
            Having trouble with payment?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSupport}
            className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Contact Support</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}; 