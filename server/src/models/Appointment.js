const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  screeningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screening'
  },
  appointmentDetails: {
    dateTime: {
      type: Date,
      required: true,
      index: true
    },
    duration: { type: Number, default: 30 }, // minutes
    type: {
      type: String,
      enum: ['in-person', 'online', 'phone'],
      default: 'in-person'
    },
    reason: String,
    symptoms: [String]
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no-show'],
    default: 'pending',
    index: true
  },
  bookingMethod: {
    type: String,
    enum: ['manual', 'ai_assistant', 'direct_call'],
    default: 'manual'
  },
  aiCallDetails: {
    callId: String,
    callDuration: Number,
    callStatus: String,
    transcript: String,
    recordingUrl: String
  },
  confirmation: {
    confirmed: { type: Boolean, default: false },
    confirmedAt: Date,
    confirmationMethod: String
  },
  reminders: [{
    sentAt: Date,
    method: String, // 'email', 'sms', 'push'
    status: String
  }],
  payment: {
    amount: Number,
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'cancelled']
    },
    method: String,
    transactionId: String
  },
  notes: {
    patientNotes: String,
    doctorNotes: String,
    systemNotes: String
  },
  blockchainHash: String
}, { timestamps: true });

// Indexes
appointmentSchema.index({ userId: 1, status: 1, 'appointmentDetails.dateTime': -1 });
appointmentSchema.index({ doctorId: 1, 'appointmentDetails.dateTime': 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
