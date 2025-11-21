require('dotenv').config({ path: './.env' });  
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Initialize Express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NeuraCare API Gateway',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'NeuraCare API Gateway',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      ml_services: '/api/ml',
      screenings: '/api/screenings',
      doctors: '/api/doctors',
      appointments: '/api/appointments',
      reports: '/api/reports'
    }
  });
});

// ==================================================================
// ML SERVICES ROUTES (NEW) - Including Cognitive Health
// ==================================================================
const mlServicesRoutes = require('./routes/mlServices');
app.use('/api/ml', mlServicesRoutes);

// Add cognitive health ML routes directly as a subroute
const cognitiveHealthRoutes = require('./routes/ml/cognitiveHealth');
app.use('/api/ml/cognitive-health', cognitiveHealthRoutes);

// ==================================================================
// API ROUTES (TO BE IMPLEMENTED)
// ==================================================================
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/screenings', require('./routes/screenings'));
// app.use('/api/doctors', require('./routes/doctors'));
// app.use('/api/appointments', require('./routes/appointments'));
// app.use('/api/reports', require('./routes/reports'));

// ==================================================================
// ERROR HANDLING
// ==================================================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// ==================================================================
// START SERVER
// ==================================================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 NeuraCare API Gateway Started');
  console.log('='.repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 ML Services: http://localhost:${PORT}/api/ml`);
  console.log(`📊 ML Health: http://localhost:${PORT}/api/ml/health`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n📋 Available ML Services:');
  console.log('  • Eye Disease Detection   → /api/ml/eye-disease/*');
  console.log('  • Mental Health Chat      → /api/ml/mental-health/*');
  console.log('  • Public Health RAG       → /api/ml/public-health/*');
  console.log('  • Cognitive Health Tests  → /api/ml/cognitive-health/*');
  console.log('='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });
});
process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      console.log('✅ Process terminated');
      process.exit(0);
    });
  });
});

module.exports = app;
