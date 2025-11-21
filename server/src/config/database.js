const mongoose = require('mongoose');

const connectDB = async () => {
  // Debug: Print the URI (hide password)
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.log('⚠️  MongoDB connection skipped (MONGODB_URI not set)');
    console.log('💡 Add MONGODB_URI to .env to enable database');
    return;
  }

  // ✅ DEBUG: Show what we're trying to connect to
  console.log('🔍 Attempting MongoDB connection...');
  console.log('🔍 URI starts with:', uri.substring(0, 20));
  console.log('🔍 URI length:', uri.length);
  console.log('🔍 First char code:', uri.charCodeAt(0));
  
  try {
    const conn = await mongoose.connect(uri);

    console.log('✅ MongoDB Atlas Connected Successfully!');
    console.log(`📂 Database Host: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    console.log(`🌍 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue without database');
  }
};

// Mongoose connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB Atlas');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🛑 MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
