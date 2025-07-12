import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, FileImage, Palette, Target, Lock, Sparkles, Scale, FileDown, Highlighter, Zap as Auto } from 'lucide-react';
import { CompressionOptions } from '../types';

interface CompressionSettingsProps {
  options: CompressionOptions;
  onOptionsChange: (options: CompressionOptions) => void;
  isPremium?: boolean;
}

export const CompressionSettings: React.FC<CompressionSettingsProps> = ({
  options,
  onOptionsChange,
  isPremium = false,
}) => {
  const handleQualityChange = (quality: number) => {
    onOptionsChange({ ...options, quality });
  };

  const handleFormatChange = (format: 'jpeg' | 'png' | 'webp' | 'auto') => {
    onOptionsChange({ ...options, format });
  };

  const handleMaintainAspectRatioChange = (maintainAspectRatio: boolean) => {
    onOptionsChange({ ...options, maintainAspectRatio });
  };

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

  const formatOptions = [
    {
      format: 'auto' as const,
      label: 'Auto',
      description: 'Smart format selection',
      subDescription: 'Smallest file size',
      icon: Auto,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-400'
    },
    {
      format: 'jpeg' as const,
      label: 'JPEG',
      description: 'Best for photos',
      subDescription: 'Lossy compression',
      icon: FileImage,
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-400'
    },
    {
      format: 'png' as const,
      label: 'PNG',
      description: 'Lossless quality',
      subDescription: 'Transparency support',
      icon: FileImage,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-400'
    },
    {
      format: 'webp' as const,
      label: 'WebP',
      description: 'Modern format',
      subDescription: 'Best compression',
      icon: FileImage,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="card-modern"
    >
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 gradient-bg-secondary rounded-2xl flex items-center justify-center">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Compression Settings</h3>
          <p className="text-neutral-400 text-sm">Choose your compression level and output format</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Quality Presets */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Target className="w-5 h-5 text-blue-400" />
            <label className="text-lg font-semibold text-white">Compression Level</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {qualityPresets.map((preset) => {
              const IconComponent = preset.icon;
              const isSelected = options.quality === preset.quality;
              
              return (
                <motion.button
                  key={preset.quality}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleQualityChange(preset.quality)}
                  className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'glass-medium border-blue-500/50'
                      : 'glass-light hover:glass-medium'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected 
                        ? 'gradient-bg-primary' 
                        : 'glass-light'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? 'text-white' : 'text-neutral-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <span className={`text-sm font-bold ${
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

        {/* Format Selection */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-purple-400" />
            <label className="text-lg font-semibold text-white">Output Format</label>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {formatOptions.map((formatOption) => {
              const IconComponent = formatOption.icon;
              const isSelected = options.format === formatOption.format;
              
              return (
                <motion.button
                  key={formatOption.format}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleFormatChange(formatOption.format)}
                  className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isSelected
                      ? 'glass-medium border-blue-500/50'
                      : 'glass-light hover:glass-medium'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="relative flex flex-col items-center space-y-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected 
                        ? 'gradient-bg-primary' 
                        : 'glass-light'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        isSelected ? 'text-white' : 'text-neutral-400'
                      }`} />
                    </div>
                    <div className="text-center">
                      <span className={`text-sm font-bold ${
                        isSelected ? 'text-white' : 'text-neutral-300'
                      }`}>
                        {formatOption.label}
                      </span>
                      <p className={`text-xs mt-1 font-medium ${
                        isSelected ? formatOption.textColor : 'text-neutral-400'
                      }`}>
                        {formatOption.description}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isSelected ? 'text-neutral-300' : 'text-neutral-500'
                      }`}>
                        {formatOption.subDescription}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
          
          {/* Format Info */}
          <div className="p-4 glass-light rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 gradient-bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Format Selection Guide</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  <strong>Auto:</strong> Smart selection for smallest file size • 
                  <strong>JPEG:</strong> Best for photos and complex images • 
                  <strong>PNG:</strong> Perfect for graphics with transparency • 
                  <strong>WebP:</strong> Modern format with excellent compression
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Toggle */}
        <div className="flex items-center justify-between p-6 glass-light rounded-2xl">
          <div className="flex-1">
            <label className="text-lg font-semibold text-white">Maintain Aspect Ratio</label>
            <p className="text-neutral-400 text-sm mt-1">Keep original image proportions</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMaintainAspectRatioChange(!options.maintainAspectRatio)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${
              options.maintainAspectRatio 
                ? 'gradient-bg-primary' 
                : 'bg-white/[0.1] border border-white/[0.2]'
            }`}
          >
            <motion.span
              className="inline-block h-6 w-6 rounded-full bg-white shadow-lg"
              animate={{
                x: options.maintainAspectRatio ? 24 : 4
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </motion.button>
        </div>

        {/* Premium Features */}
        {!isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="p-6 glass-medium rounded-2xl border-blue-500/20 bg-gradient-mesh"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 gradient-bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-2">
                  Unlock Premium Features
                </h4>
                <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                  Get advanced compression options, batch processing, and larger file sizes with our Pro plan.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-sm flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Upgrade to Pro</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}; 