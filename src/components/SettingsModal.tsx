import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  User, 
  Palette, 
  Image, 
  Info, 
  Crown,
  Download,
  Shield,
  Zap,
  Check,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  Scale,
  FileDown,
  Highlighter
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPremium: boolean;
  subscriptionTier: string;
  compressionOptions: any;
  onCompressionOptionsChange: (options: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isPremium,
  subscriptionTier,
  compressionOptions,
  onCompressionOptionsChange
}) => {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [defaultQuality, setDefaultQuality] = useState(compressionOptions.quality);
  const [defaultFormat, setDefaultFormat] = useState(compressionOptions.format);

  const qualityPresets = [
    {
      quality: 90,
      label: 'High Quality',
      description: 'Minimal compression',
      subDescription: 'Best quality, original dimensions',
      icon: Highlighter,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-400'
    },
    {
      quality: 80,
      label: 'Balanced',
      description: 'Moderate compression',
      subDescription: 'Good balance of quality & size',
      icon: Scale,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400'
    },
    {
      quality: 60,
      label: 'High Compression',
      description: 'Heavy compression',
      subDescription: 'Significant size savings',
      icon: FileDown,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-400'
    },
    {
      quality: 30,
      label: 'Maximum Compression',
      description: 'Maximum compression',
      subDescription: 'Smallest file size possible',
      icon: Sparkles,
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-400'
    }
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'compression', label: 'Compression', icon: Image },
    { id: 'account', label: 'Account', icon: User },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleSaveDefaults = () => {
    onCompressionOptionsChange({
      ...compressionOptions,
      quality: defaultQuality,
      format: defaultFormat,
    });
  };

  const getSubscriptionStatus = () => {
    if (!isPremium) return { status: 'Free', color: 'text-neutral-400', icon: AlertCircle };
    switch (subscriptionTier) {
      case 'pro': return { status: 'Pro', color: 'text-blue-400', icon: Crown };
      case 'enterprise': return { status: 'Enterprise', color: 'text-purple-400', icon: Zap };
      default: return { status: 'Free', color: 'text-neutral-400', icon: AlertCircle };
    }
  };

  const subscriptionInfo = getSubscriptionStatus();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-neutral-900/95 backdrop-blur-xl border border-white/[0.1] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 gradient-bg-primary rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Settings</h2>
                  <p className="text-sm text-neutral-400">Customize your experience</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="glass-button p-2 rounded-xl"
              >
                <X className="w-5 h-5 text-neutral-300" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Sidebar */}
              <div className="w-64 border-r border-white/[0.08] p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-white/[0.1] text-white'
                            : 'text-neutral-400 hover:text-white hover:bg-white/[0.05]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{tab.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeTab === 'general' && (
                    <motion.div
                      key="general"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">General Settings</h3>
                        <div className="space-y-4">
                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Palette className="w-5 h-5 text-blue-400" />
                              <span className="font-medium text-white">Theme</span>
                            </div>
                            <p className="text-sm text-neutral-400 mb-3">Choose your preferred theme</p>
                            <div className="grid grid-cols-3 gap-3">
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme('dark')}
                                className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                                  theme === 'dark'
                                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                    : 'bg-white/[0.05] border-white/[0.1] text-neutral-400 hover:text-white'
                                }`}
                              >
                                <Moon className="w-4 h-4" />
                                <span className="font-medium">Dark</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme('light')}
                                className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                                  theme === 'light'
                                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                    : 'bg-white/[0.05] border-white/[0.1] text-neutral-400 hover:text-white'
                                }`}
                              >
                                <Sun className="w-4 h-4" />
                                <span className="font-medium">Light</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTheme('auto')}
                                className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                                  theme === 'auto'
                                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                    : 'bg-white/[0.05] border-white/[0.1] text-neutral-400 hover:text-white'
                                }`}
                              >
                                <Monitor className="w-4 h-4" />
                                <span className="font-medium">Auto</span>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'compression' && (
                    <motion.div
                      key="compression"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Compression Defaults</h3>
                        <p className="text-sm text-neutral-400 mb-6">Set your preferred default compression settings</p>
                        
                        <div className="space-y-4">
                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Image className="w-5 h-5 text-emerald-400" />
                              <span className="font-medium text-white">Default Compression Level</span>
                            </div>
                            <p className="text-sm text-neutral-400 mb-4">Choose your preferred default compression level</p>
                            <div className="grid grid-cols-2 gap-3">
                              {qualityPresets.map((preset) => {
                                const IconComponent = preset.icon;
                                const isSelected = defaultQuality === preset.quality;
                                
                                return (
                                  <motion.button
                                    key={preset.quality}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setDefaultQuality(preset.quality)}
                                    className={`p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                                      isSelected
                                        ? 'bg-blue-500/20 border-blue-500/30'
                                        : 'bg-white/[0.05] border-white/[0.1] hover:bg-white/[0.08]'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center space-y-2">
                                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        isSelected 
                                          ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                                          : 'bg-white/[0.1]'
                                      }`}>
                                        <IconComponent className={`w-4 h-4 ${
                                          isSelected ? 'text-white' : 'text-neutral-400'
                                        }`} />
                                      </div>
                                      <div className="text-center">
                                        <span className={`text-xs font-medium ${
                                          isSelected ? 'text-white' : 'text-neutral-300'
                                        }`}>
                                          {preset.label}
                                        </span>
                                        <p className={`text-xs mt-1 font-medium ${
                                          isSelected ? preset.textColor : 'text-neutral-400'
                                        }`}>
                                          {preset.description}
                                        </p>
                                        <p className={`text-xs mt-1 ${
                                          isSelected ? 'text-neutral-300' : 'text-neutral-500'
                                        }`}>
                                          {preset.subDescription}
                                        </p>
                                      </div>
                                    </div>
                                  </motion.button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <Download className="w-5 h-5 text-purple-400" />
                              <span className="font-medium text-white">Default Format</span>
                            </div>
                            <p className="text-sm text-neutral-400 mb-3">Choose your preferred output format</p>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                              {['auto', 'jpeg', 'png', 'webp'].map((format) => (
                                <motion.button
                                  key={format}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setDefaultFormat(format)}
                                  className={`px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    defaultFormat === format
                                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                                      : 'bg-white/[0.05] border-white/[0.1] text-neutral-400 hover:text-white'
                                  }`}
                                >
                                  <span className="font-medium capitalize">{format}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveDefaults}
                            className="w-full btn-primary"
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <Check className="w-4 h-4" />
                              <span>Save as Default</span>
                            </div>
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'account' && (
                    <motion.div
                      key="account"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
                        
                        <div className="space-y-4">
                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <User className="w-5 h-5 text-blue-400" />
                              <span className="font-medium text-white">Profile</span>
                            </div>
                            {user ? (
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                      {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.emailAddresses[0]?.emailAddress || 'User'
                                      }
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                      {user.emailAddresses[0]?.emailAddress}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-400">Please sign in to view your profile</p>
                            )}
                          </div>

                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <Crown className="w-5 h-5 text-yellow-400" />
                              <span className="font-medium text-white">Subscription</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <subscriptionInfo.icon className={`w-5 h-5 ${subscriptionInfo.color}`} />
                                <span className={`font-medium ${subscriptionInfo.color}`}>
                                  {subscriptionInfo.status}
                                </span>
                              </div>
                              {!isPremium && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn-primary text-sm"
                                >
                                  Upgrade
                                </motion.button>
                              )}
                            </div>
                            <p className="text-sm text-neutral-400 mt-2">
                              {isPremium 
                                ? `You have access to all ${subscriptionInfo.status} features`
                                : 'Upgrade to unlock advanced features and remove limits'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'about' && (
                    <motion.div
                      key="about"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-white mb-4">About ImageCompress</h3>
                        
                        <div className="space-y-4">
                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <Info className="w-5 h-5 text-blue-400" />
                              <span className="font-medium text-white">Version Information</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Version</span>
                                <span className="text-white">1.0.0</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Build</span>
                                <span className="text-white">2024.1.0</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neutral-400">Environment</span>
                                <span className="text-white">{process.env.NODE_ENV}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <Shield className="w-5 h-5 text-green-400" />
                              <span className="font-medium text-white">Privacy & Security</span>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-neutral-300">Client-side processing</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-neutral-300">No data uploaded to servers</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-neutral-300">Instant downloads</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-green-400" />
                                <span className="text-neutral-300">End-to-end encryption</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-neutral-800/80 backdrop-blur-sm border border-white/[0.05] rounded-2xl p-4">
                            <div className="flex items-center space-x-3 mb-4">
                              <Zap className="w-5 h-5 text-yellow-400" />
                              <span className="font-medium text-white">Features</span>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-neutral-300">AI-powered compression</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-neutral-300">Multiple format support</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-neutral-300">Batch processing</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-neutral-300">Custom quality settings</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Check className="w-4 h-4 text-blue-400" />
                                <span className="text-neutral-300">Real-time preview</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 