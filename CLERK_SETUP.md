# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your ImageCompress Pro app.

## Step 1: Create a Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application
3. Choose "Web Application" as your app type

## Step 2: Configure Your Application

1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Add it to your `.env` file:

```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

## Step 3: Configure Authentication Settings

### Social Providers (Optional)
1. Go to **User & Authentication** → **Social Connections**
2. Enable providers like Google, GitHub, etc.
3. Configure OAuth settings for each provider

### Email Settings
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Configure email verification settings
3. Set up email templates if needed

### User Profile
1. Go to **User & Authentication** → **Profile**
2. Configure which fields are required
3. Set up profile image settings

## Step 4: Configure Allowed Origins

1. Go to **Paths** → **Allowed Origins**
2. Add your development URL: `http://localhost:3000`
3. Add your production URL when ready

## Step 5: Test Your Setup

1. Start your development server: `npm start`
2. You should see the sign-in page
3. Test creating an account and signing in
4. Verify that user settings are saved per user

## Features Included

✅ **User Authentication**: Sign up, sign in, sign out
✅ **User Profile**: Display user info in the header
✅ **User-Specific Settings**: Each user has their own settings
✅ **Beautiful UI**: Glassmorphism design matching the app
✅ **Responsive Design**: Works on all devices
✅ **Social Login**: Support for Google, GitHub, etc.
✅ **Email Verification**: Secure account creation

## Environment Variables

Make sure your `.env` file contains:

```bash
# Clerk Authentication (REQUIRED)
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# Optional: Stripe (for payments)
# REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

## Troubleshooting

### Build Errors
- Make sure your Clerk publishable key is correct
- Check that the key starts with `pk_test_` or `pk_live_`

### Authentication Not Working
- Verify your allowed origins are configured
- Check browser console for errors
- Ensure your Clerk application is active

### User Settings Not Saving
- Check that localStorage is enabled in your browser
- Verify the user is properly authenticated

## Next Steps

Once authentication is working, you can:

1. Add user-specific features (compression history, favorites)
2. Implement subscription management
3. Add user roles and permissions
4. Set up webhooks for user events

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Community](https://clerk.com/community)
- [GitHub Issues](https://github.com/your-repo/issues) 