# Stripe Payment Gateway Setup Guide

This guide will help you set up Stripe payment processing for your image compression app.

## 🚀 Quick Start

### 1. Stripe Account Setup

1. **Create a Stripe Account**
   - Go to [stripe.com](https://stripe.com) and create an account
   - Complete your business verification
   - Get your API keys from the Dashboard

2. **Get Your API Keys**
   - Navigate to Developers → API Keys in your Stripe Dashboard
   - Copy your **Publishable Key** and **Secret Key**
   - For testing, use the keys that start with `pk_test_` and `sk_test_`

### 2. Create Products and Prices

1. **Create Products**
   - Go to Products in your Stripe Dashboard
   - Create two products:
     - **Pro Plan** ($7.99/month)
     - **Enterprise Plan** ($24.99/month)

2. **Create Prices**
   - For each product, create a recurring price:
     - **Pro**: $7.99/month
     - **Enterprise**: $24.99/month
   - Copy the Price IDs (they start with `price_`)

### 3. Environment Configuration

1. **Copy Environment Template**
   ```bash
   cp env.example .env
   ```

2. **Update Environment Variables**
   ```env
   # Stripe Configuration
   STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Stripe Price IDs
   REACT_APP_STRIPE_PRO_PRICE_ID=price_your_pro_price_id
   REACT_APP_STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id

   # Frontend Environment Variables
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   REACT_APP_API_URL=http://localhost:3001

   # Server Configuration
   PORT=3001
   ```

### 4. Webhook Setup (Optional but Recommended)

1. **Install Stripe CLI**
   - Download from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
   - Login: `stripe login`

2. **Forward Webhooks**
   ```bash
   stripe listen --forward-to localhost:3001/api/webhook
   ```

3. **Copy Webhook Secret**
   - The CLI will provide a webhook secret starting with `whsec_`
   - Add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

### 5. Start the Application

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   This will start both the React frontend (port 3000) and Express backend (port 3001)

3. **Test the Integration**
   - Open http://localhost:3000
   - Click "Upgrade to Pro" or "Upgrade to Enterprise"
   - Use Stripe test cards:
     - **Success**: 4242 4242 4242 4242
     - **Decline**: 4000 0000 0000 0002

## 🔧 Configuration Details

### Frontend Configuration

The React app uses these environment variables:
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `REACT_APP_STRIPE_PRO_PRICE_ID`: Price ID for Pro plan
- `REACT_APP_STRIPE_ENTERPRISE_PRICE_ID`: Price ID for Enterprise plan
- `REACT_APP_API_URL`: Backend API URL

### Backend Configuration

The Express server uses these environment variables:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret
- `PORT`: Server port (default: 3001)

## 📁 File Structure

```
├── src/
│   ├── components/
│   │   ├── StripePayment.tsx      # Payment component
│   │   └── PricingModal.tsx       # Updated pricing modal
│   └── utils/
│       └── stripe.ts              # Stripe utilities
├── server.js                      # Express backend
├── env.example                    # Environment template
└── STRIPE_SETUP.md               # This file
```

## 🔒 Security Features

- **PCI DSS Compliant**: Stripe handles all payment data
- **256-bit SSL Encryption**: All communications are encrypted
- **Webhook Verification**: Server verifies webhook signatures
- **Environment Variables**: Sensitive data stored securely

## 🧪 Testing

### Test Cards

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Declined payment |
| 4000 0025 0000 3155 | Requires authentication |
| 4000 0000 0000 9995 | Insufficient funds |

### Test Scenarios

1. **Successful Subscription**
   - Use card 4242 4242 4242 4242
   - Should redirect to success page

2. **Failed Payment**
   - Use card 4000 0000 0000 0002
   - Should show error message

3. **Customer Portal**
   - After successful payment, test subscription management

## 🚀 Production Deployment

### 1. Update Environment Variables
- Use production Stripe keys (start with `pk_live_` and `sk_live_`)
- Set up production webhook endpoint
- Update `REACT_APP_API_URL` to your production domain

### 2. Set Up Webhooks
- Create webhook endpoint in Stripe Dashboard
- Add your production webhook URL
- Copy the webhook secret to your environment

### 3. SSL Certificate
- Ensure your domain has SSL certificate
- Stripe requires HTTPS for production

## 🆘 Troubleshooting

### Common Issues

1. **"Stripe failed to load"**
   - Check `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set correctly
   - Ensure you're using the correct key (test vs live)

2. **"Failed to create checkout session"**
   - Verify backend server is running
   - Check `STRIPE_SECRET_KEY` is correct
   - Ensure price IDs exist in your Stripe account

3. **Webhook errors**
   - Verify webhook secret is correct
   - Check webhook endpoint is accessible
   - Use Stripe CLI for local testing

### Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com)
- [React Stripe.js Documentation](https://stripe.com/docs/stripe-js)

## 📝 Next Steps

1. **Database Integration**: Store customer and subscription data
2. **User Authentication**: Add user accounts and login
3. **Subscription Management**: Implement usage tracking
4. **Analytics**: Add payment and usage analytics
5. **Email Notifications**: Send payment confirmations

---

**Note**: This implementation uses Stripe Checkout for simplicity and security. For more advanced features, consider implementing Stripe Elements for custom payment forms. 