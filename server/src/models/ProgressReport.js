const mongoose = require('mongoose');

const progressReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['comprehensive', 'eye_health', 'mental_health', 'cognitive_health', 'custom']
  },
  period: {
    startDate: Date,
    endDate: Date
  },
  screeningsIncluded: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screening'
  }],
  summary: {
    overallHealth: String,
    improvements: [String],
    concerns: [String],
    trends: mongoose.Schema.Types.Mixed
  },
  metrics: {
    eyeHealth: {
      scansCount: Number,
      latestResult: String,
      trend: String,
      riskScore: Number
    },
    mentalHealth: {
      phq9Scores: [Number],
      gad7Scores: [Number],
      trend: String,
      averageScore: Number
    },
    cognitiveHealth: {
      assessmentsCount: Number,
      overallScore: Number,
      trend: String,
      areasOfConcern: [String]
    }
  },
  recommendations: {
    lifestyle: [String],
    followUps: [String],
    specialists: [String]
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  pdfUrl: String,
  sharedWith: [{
    doctorId: mongoose.Schema.Types.ObjectId,
    sharedAt: Date,
    accessGranted: Boolean
  }],
  blockchainHash: String
}, { timestamps: true });

progressReportSchema.index({ userId: 1, reportType: 1, generatedAt: -1 });

module.exports = mongoose.model('ProgressReport', progressReportSchema);
