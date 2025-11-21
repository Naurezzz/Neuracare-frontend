const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  supabaseId: {
    type: String,
    required: true,
    unique: true
  },
  profile: {
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say']
    },
    phone: String,
    location: {
      address: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      zipCode: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  medicalHistory: {
    conditions: [String],
    allergies: [String],
    medications: [String],
    familyHistory: [String]
  },
  preferences: {
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  metadata: {
    lastLogin: Date,
    loginCount: { type: Number, default: 0 },
    accountCreated: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
