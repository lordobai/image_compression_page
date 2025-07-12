export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    
    // For now, return free tier (you'll need to implement proper database storage)
    res.json({ isActive: false, tier: 'free' });
  } catch (error) {
    console.error('Error checking subscription:', error);
    res.status(500).json({ error: error.message });
  }
} 