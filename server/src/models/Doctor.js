const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  hprId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  profile: {
    name: {
      type: String,
      required: true
    },
    specialization: [{
      type: String,
      required: true
    }],
    qualifications: [String],
    experience: Number, // years
    languages: [String],
    gender: String,
    photo: String
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  location: {
    clinicName: String,
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'India' },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: {
    schedule: mongoose.Schema.Types.Mixed,
    acceptsOnlineConsultation: { type: Boolean, default: false },
    acceptsEmergency: { type: Boolean, default: false }
  },
  fees: {
    consultation: Number,
    currency: { type: String, default: 'INR' },
    acceptsInsurance: Boolean,
    insuranceProviders: [String]
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
    reviews: [{
      userId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      review: String,
      date: Date
    }]
  },
  metadata: {
    isTopRated: { type: Boolean, default: false },
    isGovernmentVerified: { type: Boolean, default: false },
    lastVerified: Date,
    totalPatientsSeen: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Indexes for efficient search
doctorSchema.index({ 'location.coordinates': '2dsphere' });
doctorSchema.index({ 'profile.specialization': 1, 'ratings.average': -1 });
doctorSchema.index({ 'location.city': 1, 'profile.specialization': 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
