const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Screening = require('../models/Screening');
const aiCallService = require('../services/aiCallService');

// Book appointment
router.post('/book', authenticate, async (req, res) => {
  try {
    const {
      doctorId,
      screeningId,
      dateTime,
      type,
      reason,
      symptoms,
      bookingMethod
    } = req.body;

    // Get user and doctor details
    const user = await User.findOne({ supabaseId: req.userId });
    const doctor = await Doctor.findById(doctorId);
    const screening = screeningId ? await Screening.findById(screeningId) : null;

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: user._id,
      doctorId,
      screeningId,
      appointmentDetails: {
        dateTime,
        type,
        reason: reason || screening?.type || 'General consultation',
        symptoms
      },
      bookingMethod,
      status: 'pending'
    });

    // If AI booking requested
    if (bookingMethod === 'ai_assistant' && doctor.contact.phone) {
      const aiCallResult = await aiCallService.bookAppointmentWithAI({
        doctorPhone: doctor.contact.phone,
        patientName: `${user.profile.firstName} ${user.profile.lastName}`,
        patientPhone: user.profile.phone,
        preferredDateTime: dateTime,
        reason: reason || screening?.type,
        screeningType: screening?.type || 'health'
      });

      if (aiCallResult.success) {
        appointment.aiCallDetails = {
          callId: aiCallResult.callId,
          callStatus: aiCallResult.status
        };
        await appointment.save();
      }
    }

    res.status(201).json({
      success: true,
      appointment,
      message: bookingMethod === 'ai_assistant' 
        ? 'AI assistant will call the doctor to book your appointment'
        : 'Appointment created successfully. Please call the doctor to confirm.'
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment'
    });
  }
});

// Get user's appointments
router.get('/user', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.userId });
    
    const appointments = await Appointment.find({ userId: user._id })
      .populate('doctorId')
      .populate('screeningId')
      .sort({ 'appointmentDetails.dateTime': -1 });

    res.json({
      success: true,
      appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  }
});

// Get appointment details
router.get('/:appointmentId', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId)
      .populate('doctorId')
      .populate('screeningId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment'
    });
  }
});

// Get AI call status
router.get('/:appointmentId/call-status', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment || !appointment.aiCallDetails?.callId) {
      return res.status(404).json({
        success: false,
        error: 'No AI call found for this appointment'
      });
    }

    const callStatus = await aiCallService.getCallStatus(appointment.aiCallDetails.callId);
    const transcript = await aiCallService.getCallTranscript(appointment.aiCallDetails.callId);

    // Update appointment with latest info
    appointment.aiCallDetails.callStatus = callStatus.status;
    appointment.aiCallDetails.callDuration = callStatus.duration;
    appointment.aiCallDetails.transcript = transcript;
    await appointment.save();

    res.json({
      success: true,
      callStatus,
      transcript
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch call status'
    });
  }
});

// Cancel appointment
router.delete('/:appointmentId', authenticate, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.appointmentId,
      { status: 'cancelled' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Appointment cancelled',
      appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  }
});

module.exports = router;
