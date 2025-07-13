// API endpoint to check user usage limits
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, month, type } = req.body;

    if (!userId || !month) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real app, you'd query your database here
    // For now, we'll use a simple in-memory store or localStorage simulation
    
    // Get user's subscription tier (from your database)
    const userTier = await getUserTier(userId); // 'free', 'pro', 'enterprise'
    
    // Get usage limits based on tier
    const limits = {
      free: { maxImagesPerMonth: 100 },
      pro: { maxImagesPerMonth: 1000 },
      enterprise: { maxImagesPerMonth: 10000 }
    };

    const userLimit = limits[userTier]?.maxImagesPerMonth || 100;

    // Get current usage for this month
    const currentUsage = await getCurrentUsage(userId, month);

    const remaining = Math.max(0, userLimit - currentUsage);
    const canProceed = currentUsage < userLimit;

    return res.status(200).json({
      canProceed,
      currentUsage,
      limit: userLimit,
      remaining,
      message: canProceed ? null : `Monthly limit reached. Upgrade to Pro for more.`
    });

  } catch (error) {
    console.error('Error checking usage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper functions (replace with your actual database queries)
async function getUserTier(userId) {
  // Query your database for user's subscription tier
  // Example with a hypothetical database:
  // const user = await db.users.findUnique({ where: { id: userId } });
  // return user?.subscriptionTier || 'free';
  
  // For now, return 'free' as default
  return 'free';
}

async function getCurrentUsage(userId, month) {
  // Query your database for user's usage this month
  // Example with a hypothetical database:
  // const usage = await db.usage.findFirst({
  //   where: { userId, month }
  // });
  // return usage?.imagesCompressed || 0;
  
  // For now, return 0 (no usage tracked)
  return 0;
} 