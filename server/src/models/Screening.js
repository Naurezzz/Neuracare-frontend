const mongoose = require('mongoose');

const screeningSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['eye_disease', 'mental_health', 'cognitive_health', 'public_health'],
    index: true
  },
  results: {
    prediction: mongoose.Schema.Types.Mixed,
    confidence: Number,
    severity: {
      type: String,
      enum: ['none', 'low', 'mild', 'moderate', 'moderately_severe', 'high', 'severe', 'urgent']
    },
    riskLevel: String,
    detailedAnalysis: mongoose.Schema.Types.Mixed
  },
  recommendations: {
    immediate: [String],
    lifestyle: [String],
    followUp: String,
    specialistNeeded: Boolean,
    specialistType: String
  },
  metadata: {
    duration: Number, // seconds
    completedAt: { type: Date, default: Date.now },
    modelVersion: String,
    modelAccuracy: Number
  },
  files: [{
    type: String, // Supabase storage URLs
    fileType: String,
    uploadedAt: Date
  }],
  blockchainHash: String,
  sharedWith: [{
    doctorId: mongoose.Schema.Types.ObjectId,
    sharedAt: Date,
    expiresAt: Date,
    accessCount: Number
  }]
}, { timestamps: true });

// Index for efficient queries
screeningSchema.index({ userId: 1, createdAt: -1 });
screeningSchema.index({ type: 1, 'results.severity': 1 });

module.exports = mongoose.model('Screening', screeningSchema);
