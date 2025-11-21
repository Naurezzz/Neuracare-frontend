const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({ supabaseId: req.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    
    const user = await User.findOneAndUpdate(
      { supabaseId: req.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// Update location
router.put('/location', authenticate, async (req, res) => {
  try {
    const { address, city, state, coordinates } = req.body;

    const user = await User.findOneAndUpdate(
      { supabaseId: req.userId },
      {
        $set: {
          'profile.location': {
            address,
            city,
            state,
            country: 'India',
            coordinates
          }
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      location: user.profile.location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

module.exports = router;
