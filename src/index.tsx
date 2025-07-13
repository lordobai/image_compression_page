import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// You need to add your Clerk publishable key to your .env file
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Publishable Key");
}

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <SettingsProvider>
      <App />
      </SettingsProvider>
    </ClerkProvider>
  </React.StrictMode>
); 