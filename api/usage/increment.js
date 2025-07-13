// API endpoint to increment user usage after compression
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, month, imagesCompressed, sizeSaved } = req.body;

    if (!userId || !month || !imagesCompressed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real app, you'd update your database here
    await incrementUserUsage(userId, month, imagesCompressed, sizeSaved);

    return res.status(200).json({ 
      success: true, 
      message: 'Usage updated successfully' 
    });

  } catch (error) {
    console.error('Error incrementing usage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to increment usage in database
async function incrementUserUsage(userId, month, imagesCompressed, sizeSaved) {
  // Example with a hypothetical database (Prisma, MongoDB, etc.):
  
  // Option 1: Upsert approach (create if doesn't exist, update if exists)
  // await db.usage.upsert({
  //   where: { userId_month: { userId, month } },
  //   update: {
  //     imagesCompressed: { increment: imagesCompressed },
  //     totalSizeSaved: { increment: sizeSaved },
  //     lastUpdated: new Date()
  //   },
  //   create: {
  //     userId,
  //     month,
  //     imagesCompressed,
  //     totalSizeSaved: sizeSaved,
  //     lastUpdated: new Date()
  //   }
  // });

  // Option 2: MongoDB approach
  // await db.collection('usage').updateOne(
  //   { userId, month },
  //   {
  //     $inc: { 
  //       imagesCompressed: imagesCompressed,
  //       totalSizeSaved: sizeSaved 
  //     },
  //     $set: { lastUpdated: new Date() }
  //   },
  //   { upsert: true }
  // );

  // Option 3: Simple SQL approach
  // INSERT INTO usage (user_id, month, images_compressed, total_size_saved, last_updated)
  // VALUES (?, ?, ?, ?, NOW())
  // ON DUPLICATE KEY UPDATE
  //   images_compressed = images_compressed + VALUES(images_compressed),
  //   total_size_saved = total_size_saved + VALUES(total_size_saved),
  //   last_updated = NOW();

  // For now, just log the usage (replace with actual database call)
  console.log(`Usage updated for user ${userId} in ${month}:`, {
    imagesCompressed,
    sizeSaved,
    timestamp: new Date().toISOString()
  });
} 