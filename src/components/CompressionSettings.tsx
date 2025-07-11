import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, FileImage, Palette, Target, Lock } from 'lucide-react';
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

  const handleFormatChange = (format: 'jpeg' | 'png' | 'webp') => {
    onOptionsChange({ ...options, format });
  };

  const handleMaintainAspectRatioChange = (maintainAspectRatio: boolean) => {
    onOptionsChange({ ...options, maintainAspectRatio });
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 80) return 'High Quality';
    if (quality >= 60) return 'Balanced';
    if (quality >= 40) return 'Smaller Size';
    return 'Maximum Compression';
  };

  const getQualityColor = (quality: number) => {
    if (quality >= 80) return 'text-emerald-400';
    if (quality >= 60) return 'text-blue-400';
    if (quality >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityGradient = (quality: number) => {
    if (quality >= 80) return 'from-emerald-500 to-emerald-600';
    if (quality >= 60) return 'from-blue-500 to-blue-600';
    if (quality >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

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
          <p className="text-neutral-400 text-sm">Fine-tune your compression preferences</p>
        </div>
      </div>

      <div className="space-y-8">
      {/* Quality Slider */}
        <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-blue-400" />
              <label className="text-lg font-semibold text-white">Quality</label>
            </div>
            <motion.div
              className={`px-4 py-2 rounded-xl glass-light ${getQualityColor(options.quality)}`}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-bold">{options.quality}%</span>
              <span className="ml-2 text-sm opacity-80">- {getQualityLabel(options.quality)}</span>
            </motion.div>
        </div>
        
          <div className="space-y-4">
        <div className="relative">
          <input
            type="range"
            min="10"
            max="100"
            value={options.quality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="slider-modern"
          />
              <div className="flex justify-between text-sm text-neutral-400 mt-3">
            <span>10%</span>
            <span>100%</span>
              </div>
            </div>
            
            {/* Quality indicator bar */}
            <div className="progress-modern">
              <motion.div 
                className={`progress-fill-modern bg-gradient-to-r ${getQualityGradient(options.quality)}`}
                initial={{ width: 0 }}
                animate={{ width: `${options.quality}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Palette className="w-5 h-5 text-purple-400" />
            <label className="text-lg font-semibold text-white">Output Format</label>
      </div>

          <div className="grid grid-cols-3 gap-4">
          {(['jpeg', 'png', 'webp'] as const).map((format) => (
              <motion.button
              key={format}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              onClick={() => handleFormatChange(format)}
                className={`p-6 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                options.format === format
                    ? 'glass-medium border-blue-500/50'
                    : 'glass-light hover:glass-medium'
                }`}
              >
                {options.format === format && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                <div className="relative flex flex-col items-center space-y-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    options.format === format 
                      ? 'gradient-bg-primary' 
                      : 'glass-light'
                  }`}>
                    <FileImage className={`w-6 h-6 ${
                      options.format === format ? 'text-white' : 'text-neutral-400'
                    }`} />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-bold uppercase ${
                      options.format === format ? 'text-white' : 'text-neutral-300'
                    }`}>
                      {format}
                    </span>
                    <p className={`text-xs mt-1 ${
                      options.format === format ? 'text-blue-300' : 'text-neutral-500'
                    }`}>
                      {format === 'jpeg' && 'Best for photos'}
                      {format === 'png' && 'Lossless quality'}
                      {format === 'webp' && 'Modern format'}
                    </p>
                  </div>
              </div>
              </motion.button>
          ))}
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