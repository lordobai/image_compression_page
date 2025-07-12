export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    
    // For now, just return success (you'll need to implement proper database storage)
    res.json({ message: 'Subscription cleared successfully' });
  } catch (error) {
    console.error('Error clearing subscription:', error);
    res.status(500).json({ error: error.message });
  }
} 