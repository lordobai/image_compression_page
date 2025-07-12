# 🚀 Production Deployment Guide for Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Stripe Account**: Set up your Stripe account and get API keys
4. **Clerk Account**: Set up authentication with Clerk

## 🔧 Environment Variables Setup

### Required Environment Variables

Set these in your Vercel project settings:

```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key

# Stripe Price IDs (create these in your Stripe dashboard)
REACT_APP_STRIPE_PRO_PRICE_ID=price_pro_monthly_id
REACT_APP_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id

# Frontend Environment Variables
REACT_APP_API_URL=https://your-domain.vercel.app

# Production Configuration
NODE_ENV=production
FRONTEND_URL=https://your-domain.vercel.app

# Development Test Mode (set to false for production)
REACT_APP_ENABLE_TEST_MODE=false
```

## 📋 Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository

### 2. Configure Build Settings

- **Framework Preset**: Other
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Set Environment Variables

1. In your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add each environment variable from the list above
4. Make sure to set them for **Production**, **Preview**, and **Development**

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your app will be available at `https://your-project.vercel.app`

## 🔐 Security Checklist

### ✅ Before Deployment

- [ ] Remove all hardcoded API keys
- [ ] Set `NODE_ENV=production`
- [ ] Use production Stripe keys (`sk_live_` and `pk_live_`)
- [ ] Use production Clerk keys (`pk_live_`)
- [ ] Set `REACT_APP_ENABLE_TEST_MODE=false`
- [ ] Update `REACT_APP_API_URL` to your production domain
- [ ] Remove debug routes and information

### ✅ After Deployment

- [ ] Test authentication flow
- [ ] Test payment processing
- [ ] Verify environment variables are loaded
- [ ] Check that no sensitive data is exposed
- [ ] Test image compression functionality
- [ ] Verify CORS settings

## 🛠️ Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure all variables start with `REACT_APP_` for frontend
   - Check Vercel environment variable settings
   - Redeploy after adding variables

2. **CORS Errors**
   - Update `FRONTEND_URL` in environment variables
   - Check server.js CORS configuration

3. **Build Failures**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify TypeScript compilation

4. **Authentication Issues**
   - Verify Clerk publishable key is correct
   - Check Clerk dashboard for domain configuration
   - Ensure redirect URLs are set correctly

## 🔄 Continuous Deployment

Once set up, Vercel will automatically deploy:
- **Production**: When you push to `main` branch
- **Preview**: When you create pull requests

## 📊 Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Check Vercel function logs
- **Uptime**: Monitor your domain availability

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for all secrets**
3. **Regularly rotate API keys**
4. **Monitor for suspicious activity**
5. **Keep dependencies updated**

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review environment variable configuration
3. Test locally with production environment variables
4. Contact support with specific error messages

---

**Remember**: Always test thoroughly in a staging environment before deploying to production! 