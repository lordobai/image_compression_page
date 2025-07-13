import React from 'react';
import { motion } from 'framer-motion';
import { Crown, X, Zap, Sparkles, Download, History, Shield, Users } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

interface PremiumUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'limit-reached' | 'feature-locked' | 'manual';
}

export const PremiumUpgradeModal: React.FC<PremiumUpgradeModalProps> = ({
  isOpen,
  onClose,
  trigger = 'manual'
}) => {
  const { upgradeToPro, usageLimits } = useSubscription();

  const handleUpgrade = () => {
    upgradeToPro();
    onClose();
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case 'limit-reached':
        return 'You\'ve reached your free tier limit. Upgrade to Pro for unlimited compression!';
      case 'feature-locked':
        return 'This feature is available for Pro users. Upgrade to unlock advanced features!';
      default:
        return 'Unlock the full potential of ShrinkMyPhoto with Pro features!';
    }
  };

  const features = [
    {
      icon: Download,
      title: 'Bulk Download',
      description: 'Download all compressed images at once'
    },
    {
      icon: History,
      title: 'Compression History',
      description: 'Access your compression history and re-download files'
    },
    {
      icon: Sparkles,
      title: 'Advanced Formats',
      description: 'Support for AVIF, HEIC, and more formats'
    },
    {
      icon: Shield,
      title: 'No Ads',
      description: 'Enjoy an ad-free experience'
    },
    {
      icon: Zap,
      title: 'Higher Limits',
      description: 'Up to 50MB files and 50 images per batch'
    },
    {
      icon: Users,
      title: 'Priority Support',
      description: 'Get help when you need it most'
    }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-neutral-900/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-bg-primary rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Upgrade to Pro</h2>
              <p className="text-sm text-neutral-400">Unlock premium features</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="glass-button p-2 rounded-lg"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>
        </div>

        {/* Trigger Message */}
        <div className="mb-6 p-4 glass-light rounded-xl border border-blue-500/20">
          <p className="text-white text-center">{getTriggerMessage()}</p>
        </div>

        {/* Pricing */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-white mb-2">
              $9<span className="text-lg text-neutral-400">/month</span>
            </div>
            <p className="text-neutral-400">Cancel anytime • 30-day money-back guarantee</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-3 p-4 glass-light rounded-xl"
              >
                <div className="w-8 h-8 gradient-bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm text-neutral-400">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Plan Comparison</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 glass-light rounded-lg">
              <span className="text-neutral-300">Max file size</span>
              <div className="flex items-center space-x-4">
                <span className="text-neutral-400">{usageLimits.free.maxFileSizeMB}MB</span>
                <span className="text-white font-semibold">{usageLimits.pro.maxFileSizeMB}MB</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 glass-light rounded-lg">
              <span className="text-neutral-300">Batch processing</span>
              <div className="flex items-center space-x-4">
                <span className="text-neutral-400">{usageLimits.free.maxBatchSize} files</span>
                <span className="text-white font-semibold">{usageLimits.pro.maxBatchSize} files</span>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 glass-light rounded-lg">
              <span className="text-neutral-300">Monthly limit</span>
              <div className="flex items-center space-x-4">
                <span className="text-neutral-400">{usageLimits.free.maxImagesPerMonth} images</span>
                <span className="text-white font-semibold">{usageLimits.pro.maxImagesPerMonth} images</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            className="btn-primary flex-1 py-4 text-lg font-semibold"
          >
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="btn-secondary flex-1 py-4"
          >
            Maybe Later
          </motion.button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            Secure payment powered by Stripe • Your data is never stored on our servers
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}; 