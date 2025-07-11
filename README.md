# ImageCompress Pro - Ultra-Modern Image Compression App

A beautiful, fast, and mobile-friendly image compression web application with Stripe payments and Clerk authentication.

## ✨ Features

- **Ultra-Modern UI**: Glassmorphism design with smooth animations
- **Client-Side Processing**: Your images never leave your device
- **Batch Processing**: Upload multiple images at once (Pro feature)
- **Advanced Compression**: Multiple formats and quality settings
- **Stripe Integration**: Secure subscription payments
- **Clerk Authentication**: User management and authentication
- **Responsive Design**: Works perfectly on all devices
- **Real-time Preview**: See compression results instantly

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Stripe account
- Clerk account

### 1. Clone and Install

   ```bash
git clone <repository-url>
cd image_compression_page
   npm install
   ```

### 2. Set up Environment Variables

Create a `.env` file in the root directory:

```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Stripe Price IDs (create these in your Stripe dashboard)
REACT_APP_STRIPE_PRO_PRICE_ID=price_pro_monthly_id_here
REACT_APP_STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly_id_here

# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:3001

# Server Configuration
PORT=3001
```

### 3. Set up Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your publishable key to `REACT_APP_CLERK_PUBLISHABLE_KEY`
4. Configure your authentication settings in the Clerk dashboard

### 4. Set up Stripe

1. Go to [stripe.com](https://stripe.com) and create an account
2. Get your secret key from the Stripe dashboard
3. Create two subscription products in Stripe:
   - **Pro Plan**: $7.99/month
   - **Enterprise Plan**: $24.99/month
4. Copy the price IDs to your environment variables

### 5. Start Development

```bash
npm run dev
```

This will start both the frontend (port 3000) and backend (port 3001) concurrently.

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend (Node.js + Express)
- **Express.js** server
- **Stripe** for payment processing
- **CORS** enabled for frontend communication

### Key Components

- `App.tsx` - Main application with authentication and routing
- `PricingModal.tsx` - Subscription plans with Stripe checkout
- `ImageDropzone.tsx` - File upload with drag & drop
- `CompressionSettings.tsx` - Compression options
- `ImagePreview.tsx` - Results display
- `server.js` - Backend API for Stripe integration

## 💳 Payment Flow

1. User signs up/in with Clerk
2. User selects a subscription plan
3. Frontend calls backend to create Stripe checkout session
4. User is redirected to Stripe's hosted checkout page
5. After payment, user is redirected back to success page
6. User gets access to premium features

## 🔧 Customization

### Styling
The app uses a sophisticated dark theme with glassmorphism effects. Customize colors and animations in:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles and animations

### Features
- Modify compression options in `src/utils/compression.ts`
- Update pricing tiers in `src/components/PricingModal.tsx`
- Customize authentication flow in Clerk dashboard

## 📱 Mobile Support

The app is fully responsive and optimized for mobile devices with:
- Touch-friendly interface
- Optimized file upload for mobile
- Responsive grid layouts
- Mobile-optimized animations

## 🔒 Security

- **Client-side processing**: Images are compressed locally
- **No data storage**: Images are never uploaded to servers
- **Secure payments**: Stripe handles all payment data
- **Authentication**: Clerk provides secure user management

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Set environment variables in your hosting platform

### Backend (Railway/Heroku)
1. Deploy `server.js` to your backend platform
2. Set environment variables
3. Update `REACT_APP_API_URL` to point to your backend

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using modern web technologies 