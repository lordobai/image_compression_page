import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserButton, useUser, SignIn } from '@clerk/clerk-react';
import { User, Crown, LogIn, X } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [showSignIn, setShowSignIn] = useState(false);

  if (isSignedIn) {
    return (
      <div className="flex items-center space-x-3">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center space-x-2 glass-light rounded-xl px-3 py-1.5"
        >
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 gradient-bg-primary rounded-lg flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-medium text-white">
                {user?.firstName || user?.username || 'User'}
              </div>
              <div className="text-xs text-neutral-400">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
          </div>
          
          {/* Pro Badge */}
          <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
            <Crown className="w-2.5 h-2.5 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">Pro</span>
          </div>
        </motion.div>

        {/* Clerk User Button */}
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-8 h-8",
              userButtonTrigger: "focus:shadow-none",
            }
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* Sign In Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSignIn(true)}
        className="btn-secondary flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm"
      >
        <LogIn className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Sign In</span>
      </motion.button>

      {/* Sign In Modal - Rendered via Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSignIn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSignIn(false)}
            >
                          <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-[calc(100vw-2rem)] max-w-lg max-h-[90vh] overflow-y-auto bg-neutral-900/95 backdrop-blur-xl rounded-2xl p-4 border border-white/[0.1] shadow-2xl mx-4 relative"
              style={{ overflowX: 'hidden' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowSignIn(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-400 hover:text-white transition-colors z-10"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-neutral-400 text-sm">
                  Sign in to save your settings and access premium features
                </p>
              </div>

              <div className="clerk-form-container" style={{ width: '100%', maxWidth: '100%', overflow: 'hidden', padding: '0', margin: '0' }}>
                <SignIn 
                  appearance={{
                    elements: {
                      rootBox: "w-full max-w-full overflow-hidden",
                      card: "bg-transparent shadow-none border-none p-0 w-full max-w-full overflow-hidden",
                      headerTitle: "hidden",
                      headerSubtitle: "hidden",
                      formButtonPrimary: "btn-primary w-full max-w-full overflow-hidden",
                      formButtonSecondary: "btn-secondary w-full max-w-full overflow-hidden",
                      formFieldInput: "px-3 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50 text-sm w-full max-w-full overflow-hidden",
                      formFieldLabel: "text-white font-medium mb-2 block text-sm w-full max-w-full overflow-hidden",
                      formFieldLabelRow: "mb-2 w-full max-w-full overflow-hidden",
                      formFieldInputShowPasswordButton: "text-neutral-400 hover:text-white",
                      dividerLine: "bg-white/[0.1]",
                      dividerText: "text-neutral-400",
                      socialButtonsBlockButton: "btn-secondary mb-3 w-full max-w-full overflow-hidden",
                      socialButtonsBlockButtonText: "text-white",
                      footerActionLink: "text-blue-400 hover:text-blue-300",
                      footerActionText: "text-neutral-400",
                      identityPreviewText: "text-white",
                      identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                      formResendCodeLink: "text-blue-400 hover:text-blue-300",
                      otpCodeFieldInput: "px-3 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50 text-center text-lg w-full max-w-full overflow-hidden",
                      formFieldAction: "text-blue-400 hover:text-blue-300",
                      alert: "bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4 w-full max-w-full overflow-hidden",
                      alertText: "text-red-400",
                      formFieldErrorText: "text-red-400 text-sm mt-1",
                      formFieldSuccessText: "text-green-400 text-sm mt-1",
                    },
                    variables: {
                      colorPrimary: '#667eea',
                      colorBackground: 'transparent',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorInputBackground: '#1f2937',
                      colorInputText: '#ffffff',
                    }
                  }}
                />
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={() => setShowSignIn(false)}
                  className="text-sm text-neutral-400 hover:text-white transition-colors"
                >
                  Continue without signing in
                </button>
              </div>
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}; 