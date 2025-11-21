const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const reportService = require('../services/reportService');
const User = require('../models/User');

// Generate new report
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    const user = await User.findOne({ supabaseId: req.userId });

    const dateRange = startDate && endDate ? { startDate, endDate } : null;

    const report = await reportService.generateReport(
      user._id,
      reportType || 'comprehensive',
      dateRange
    );

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Report generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate report'
    });
  }
});

// Get user's reports
router.get('/user', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const user = await User.findOne({ supabaseId: req.userId });

    const reports = await reportService.getUserReports(user._id, parseInt(limit));

    res.json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports'
    });
  }
});

// Get specific report
router.get('/:reportId', authenticate, async (req, res) => {
  try {
    const report = await reportService.getReport(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report'
    });
  }
});

module.exports = router;
