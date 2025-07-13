import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from '@clerk/clerk-react';
import { Camera, Sparkles } from 'lucide-react';

export const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial animate-float opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-mesh animate-float opacity-15" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial animate-pulse-slow opacity-10"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="flex items-center justify-center space-x-4 mb-6"
            >
              <div className="relative">
                <div className="w-16 h-16 gradient-bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
                  <Camera className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-bg-accent rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text-primary">ImageCompress</h1>
                <p className="text-sm text-neutral-400 font-mono">Pro Edition</p>
              </div>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-lg text-neutral-300"
            >
              Sign in to access your personalized compression experience
            </motion.p>
          </div>

          {/* Sign In Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="glass-panel rounded-2xl p-8 border border-white/[0.08]"
          >
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-none p-0",
                  headerTitle: "text-white text-2xl font-bold mb-2",
                  headerSubtitle: "text-neutral-400 text-sm",
                  formButtonPrimary: "btn-primary w-full",
                  formButtonSecondary: "btn-secondary w-full",
                  formFieldInput: "w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50",
                  formFieldLabel: "text-white font-medium mb-2 block",
                  formFieldLabelRow: "mb-2",
                  formFieldInputShowPasswordButton: "text-neutral-400 hover:text-white",
                  dividerLine: "bg-white/[0.1]",
                  dividerText: "text-neutral-400",
                  socialButtonsBlockButton: "btn-secondary w-full mb-3",
                  socialButtonsBlockButtonText: "text-white",
                  footerActionLink: "text-blue-400 hover:text-blue-300",
                  footerActionText: "text-neutral-400",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
                  formResendCodeLink: "text-blue-400 hover:text-blue-300",
                  otpCodeFieldInput: "w-full px-4 py-3 bg-neutral-800/80 rounded-xl border border-white/[0.1] text-white focus:outline-none focus:border-blue-500/50 text-center text-lg",
                  formFieldAction: "text-blue-400 hover:text-blue-300",
                  alert: "bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl p-4 mb-4",
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
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-neutral-500">
              Secure authentication powered by{' '}
              <span className="text-blue-400">Clerk</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}; 