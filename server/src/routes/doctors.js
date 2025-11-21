const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const doctorService = require('../services/doctorService');
const User = require('../models/User');

// Search doctors based on specialization and location
router.post('/search', authenticate, async (req, res) => {
  try {
    const { specialization, location, includeNearby = true } = req.body;

    // Get user's location if not provided
    let userLocation = location;
    if (!userLocation && includeNearby) {
      const user = await User.findOne({ supabaseId: req.userId });
      userLocation = user?.profile?.location?.coordinates;
    }

    // Get top-rated doctors across India
    const topDoctors = await doctorService.getTopRatedDoctors(specialization, 5);

    // Get nearby doctors if location available
    let nearbyDoctors = [];
    if (userLocation && includeNearby) {
      nearbyDoctors = await doctorService.findNearbyDoctors(
        specialization,
        userLocation,
        10 // 10 km radius
      );
    }

    res.json({
      success: true,
      results: {
        topRatedIndia: topDoctors,
        nearby: nearbyDoctors,
        totalFound: topDoctors.length + nearbyDoctors.length
      }
    });
  } catch (error) {
    console.error('Doctor search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search doctors'
    });
  }
});

// Get doctor details
router.get('/:doctorId', authenticate, async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get doctor details'
    });
  }
});

// Verify doctor credentials
router.post('/:doctorId/verify', authenticate, async (req, res) => {
  try {
    const doctor = await doctorService.getDoctorById(req.params.doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const verifiedDoctor = await doctorService.verifyDoctorCredentials(doctor.hprId);

    res.json({
      success: true,
      verified: verifiedDoctor.verified,
      doctor: verifiedDoctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

module.exports = router;
