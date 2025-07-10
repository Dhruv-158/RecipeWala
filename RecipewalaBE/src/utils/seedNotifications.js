// Utility to seed notifications for a user (for testing)
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function seed(userId) {
  await mongoose.connect(MONGO_URI);
  const notifs = [
    {
      user: userId,
      type: 'info',
      title: 'Welcome!',
      message: 'Thanks for joining RecipeWala!',
    },
    {
      user: userId,
      type: 'recipe',
      title: 'Recipe favorited',
      message: 'Your recipe was added to favorites!',
    },
    {
      user: userId,
      type: 'dashboard',
      title: 'Dashboard updated',
      message: 'Your dashboard stats were updated.',
    },
  ];
  await Notification.insertMany(notifs);
  console.log('Seeded notifications for user:', userId);
  await mongoose.disconnect();
}

// Usage: node src/utils/seedNotifications.js <userId>
if (require.main === module) {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node src/utils/seedNotifications.js <userId>');
    process.exit(1);
  }
  seed(userId).catch(console.error);
}
