# Database Schema for Usage Tracking

## Overview
This document outlines the database schema needed to implement monthly usage limits for ShrinkMyPhoto.

## Tables

### 1. Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier ENUM('free', 'pro', 'enterprise') DEFAULT 'free',
  subscription_status ENUM('active', 'canceled', 'past_due') DEFAULT 'active',
  current_period_end TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. Usage Tracking Table
```sql
CREATE TABLE usage_tracking (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  month VARCHAR(7) NOT NULL, -- Format: "2024-01"
  images_compressed INT DEFAULT 0,
  total_size_saved BIGINT DEFAULT 0, -- in bytes
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY unique_user_month (user_id, month),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_month (user_id, month)
);
```

### 3. Compression History Table (Premium Feature)
```sql
CREATE TABLE compression_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  original_size BIGINT NOT NULL,
  compressed_size BIGINT NOT NULL,
  compression_ratio DECIMAL(5,2) NOT NULL,
  format VARCHAR(10) NOT NULL,
  quality INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at)
);
```

## MongoDB Alternative Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  clerkId: String, // Clerk user ID
  email: String,
  subscription: {
    tier: String, // 'free', 'pro', 'enterprise'
    status: String, // 'active', 'canceled', 'past_due'
    currentPeriodEnd: Date,
    stripeCustomerId: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Usage Collection
```javascript
{
  _id: ObjectId,
  userId: String, // Clerk user ID
  month: String, // "2024-01"
  imagesCompressed: Number,
  totalSizeSaved: Number, // in bytes
  lastUpdated: Date
}
```

### Compression History Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  originalFilename: String,
  originalSize: Number,
  compressedSize: Number,
  compressionRatio: Number,
  format: String,
  quality: Number,
  createdAt: Date
}
```

## API Endpoints

### 1. Check Usage Limits
```
POST /api/usage/check
{
  "userId": "user_123",
  "month": "2024-01",
  "type": "monthly"
}

Response:
{
  "canProceed": true,
  "currentUsage": 45,
  "limit": 100,
  "remaining": 55,
  "message": null
}
```

### 2. Increment Usage
```
POST /api/usage/increment
{
  "userId": "user_123",
  "month": "2024-01",
  "imagesCompressed": 5,
  "sizeSaved": 2048576
}

Response:
{
  "success": true,
  "message": "Usage updated successfully"
}
```

### 3. Get User Usage
```
GET /api/usage/{userId}?month=2024-01

Response:
{
  "userId": "user_123",
  "month": "2024-01",
  "imagesCompressed": 50,
  "totalSizeSaved": 10485760,
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

## Implementation Notes

### 1. Monthly Reset
- Usage resets automatically each month
- No need to manually reset - just track by month
- Each month creates a new record in usage_tracking

### 2. Guest Users
- Guest users (not logged in) don't have usage tracking
- They can still use the service but won't see usage stats
- Consider implementing IP-based rate limiting for guests

### 3. Error Handling
- If usage tracking fails, don't block compression
- Log errors for monitoring
- Provide fallback behavior

### 4. Performance
- Index on (user_id, month) for fast lookups
- Consider caching usage data for active users
- Use upsert operations to avoid race conditions

### 5. Security
- Validate user permissions on all endpoints
- Use Clerk authentication to verify user identity
- Sanitize all inputs

## Example Queries

### Get Current Month Usage
```sql
SELECT * FROM usage_tracking 
WHERE user_id = ? AND month = DATE_FORMAT(NOW(), '%Y-%m');
```

### Upsert Usage (MySQL)
```sql
INSERT INTO usage_tracking (user_id, month, images_compressed, total_size_saved)
VALUES (?, ?, ?, ?)
ON DUPLICATE KEY UPDATE
  images_compressed = images_compressed + VALUES(images_compressed),
  total_size_saved = total_size_saved + VALUES(total_size_saved),
  last_updated = NOW();
```

### Get User's Subscription Tier
```sql
SELECT subscription_tier FROM users WHERE id = ?;
```

This schema provides a solid foundation for implementing usage tracking and premium features in your image compression app. 