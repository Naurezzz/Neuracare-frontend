console.log('Current directory:', __dirname);
console.log('Trying to import User model...');

try {
  const User = require('../models/User.js');
  console.log('✅ SUCCESS! User model loaded:', User.modelName);
} catch (error) {
  console.error('❌ ERROR:', error.message);
  console.error('Full error:', error);
}
