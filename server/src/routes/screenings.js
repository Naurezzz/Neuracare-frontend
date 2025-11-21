const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Screening = require('../models/Screening');
const User = require('../models/User');
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to call ML microservices
async function callMLService(serviceUrl, endpoint, data, files = null) {
  try {
    const url = `${serviceUrl}${endpoint}`;
    
    if (files) {
      const formData = new FormData();
      formData.append('file', files.buffer, files.originalname);
      if (data.user_id) formData.append('user_id', data.user_id);
      
      const response = await axios.post(url, formData, {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      });
      return response.data;
    } else {
      const response = await axios.post(url, data);
      return response.data;
    }
  } catch (error) {
    console.error(`ML Service Error (${serviceUrl}):`, error.message);
    throw new Error('ML service unavailable');
  }
}

// Eye Disease Screening
router.post('/eye-disease', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const user = await User.findOne({ supabaseId: req.userId });

    // Call Eye Disease ML service
    const mlResult = await callMLService(
      process.env.EYE_DISEASE_API,
      '/analyze',
      { user_id: user._id.toString() },
      req.file
    );

    // Save screening result
    const screening = await Screening.create({
      userId: user._id,
      type: 'eye_disease',
      results: {
        prediction: mlResult.report.prediction.disease,
        confidence: mlResult.report.prediction.confidence,
        severity: mlResult.report.assessment.severity,
        riskLevel: mlResult.report.assessment.risk_level,
        detailedAnalysis: mlResult.report
      },
      recommendations: {
        immediate: mlResult.report.recommendations.immediate_action ? 
          [mlResult.report.recommendations.immediate_action] : [],
        lifestyle: mlResult.report.recommendations.lifestyle || [],
        followUp: mlResult.report.next_steps.when_to_see_doctor,
        specialistNeeded: mlResult.report.next_steps.specialist ? true : false,
        specialistType: mlResult.report.next_steps.specialist
      },
      metadata: {
        modelVersion: 'EfficientNet-B0',
        modelAccuracy: mlResult.report.model_info.accuracy
      }
    });

    res.json({
      success: true,
      screening: {
        id: screening._id,
        type: screening.type,
        results: screening.results,
        recommendations: screening.recommendations,
        timestamp: screening.createdAt
      },
      needsAppointment: screening.recommendations.specialistNeeded
    });
  } catch (error) {
    console.error('Eye disease screening error:', error);
    res.status(500).json({
      success: false,
      error: 'Screening failed'
    });
  }
});

// Mental Health Screening
router.post('/mental-health', authenticate, async (req, res) => {
  try {
    const { action, user_message } = req.body;
    const user = await User.findOne({ supabaseId: req.userId });

    let mlResult;

    if (action === 'start') {
      // Start new session
      mlResult = await callMLService(
        process.env.MENTAL_HEALTH_API,
        '/start-session',
        { user_id: user._id.toString() }
      );
    } else if (action === 'chat') {
      // Continue conversation
      mlResult = await callMLService(
        process.env.MENTAL_HEALTH_API,
        '/chat',
        {
          user_id: user._id.toString(),
          message: user_message
        }
      );
    }

    // If PHQ-9 complete, save screening
    if (mlResult.agent_response?.type === 'phq9_result') {
      const result = mlResult.agent_response;
      
      const screening = await Screening.create({
        userId: user._id,
        type: 'mental_health',
        results: {
          prediction: result.severity_label,
          confidence: 100, // PHQ-9 is deterministic
          severity: result.severity,
          riskLevel: result.action,
          detailedAnalysis: {
            score: result.score,
            max_score: result.max_score,
            interpretation: result.message
          }
        },
        recommendations: {
          immediate: [result.recommendation],
          lifestyle: result.resources?.self_care || [],
          specialistNeeded: ['moderate', 'moderately_severe', 'severe'].includes(result.severity),
          specialistType: 'Clinical Psychologist or Psychiatrist'
        },
        metadata: {
          modelVersion: 'PHQ-9',
          completedAt: new Date()
        }
      });

      return res.json({
        success: true,
        screening: {
          id: screening._id,
          results: screening.results,
          recommendations: screening.recommendations
        },
        needsAppointment: screening.recommendations.specialistNeeded,
        sessionComplete: true
      });
    }

    res.json({
      success: true,
      response: mlResult.agent_response,
      sessionComplete: false
    });
  } catch (error) {
    console.error('Mental health screening error:', error);
    res.status(500).json({
      success: false,
      error: 'Screening failed'
    });
  }
});

// Public Health Query
router.post('/public-health', authenticate, async (req, res) => {
  try {
    const { question } = req.body;
    const user = await User.findOne({ supabaseId: req.userId });

    const mlResult = await callMLService(
      process.env.PUBLIC_HEALTH_API,
      '/ask',
      { question, user_id: user._id.toString() }
    );

    // Log query for analytics
    await Screening.create({
      userId: user._id,
      type: 'public_health',
      results: {
        prediction: mlResult.answer.category,
        confidence: mlResult.answer.confidence,
        detailedAnalysis: mlResult.answer
      },
      metadata: {
        query: question,
        completedAt: new Date()
      }
    });

    res.json({
      success: true,
      answer: mlResult.answer
    });
  } catch (error) {
    console.error('Public health query error:', error);
    res.status(500).json({
      success: false,
      error: 'Query failed'
    });
  }
});

// Cognitive Health Screening
router.post('/cognitive-health', authenticate, upload.single('audio'), async (req, res) => {
  try {
    const { test_type } = req.body;
    const user = await User.findOne({ supabaseId: req.userId });

    let mlResult;

    if (test_type === 'speech' && req.file) {
      mlResult = await callMLService(
        process.env.COGNITIVE_HEALTH_API,
        '/analyze-speech',
        { user_id: user._id.toString() },
        req.file
      );
    } else if (test_type === 'reading') {
      mlResult = await callMLService(
        process.env.COGNITIVE_HEALTH_API,
        '/analyze-reading',
        req.body
      );
    } else if (test_type === 'eye-tracking') {
      mlResult = await callMLService(
        process.env.COGNITIVE_HEALTH_API,
        '/analyze-gaze',
        req.body
      );
    }

    // Save screening
    const screening = await Screening.create({
      userId: user._id,
      type: 'cognitive_health',
      results: {
        prediction: mlResult.assessment?.condition || 'normal',
        confidence: mlResult.confidence || 0,
        severity: mlResult.risk_assessment?.severity || 'none',
        riskLevel: mlResult.risk_assessment?.urgency || 'No action needed',
        detailedAnalysis: mlResult
      },
      recommendations: {
        immediate: mlResult.recommendations?.immediate_actions || [],
        lifestyle: mlResult.recommendations?.exercises || [],
        specialistNeeded: mlResult.specialist_needed || false,
        specialistType: mlResult.recommendations?.specialist || null
      },
      metadata: {
        testType: test_type,
        completedAt: new Date()
      }
    });

    res.json({
      success: true,
      screening: {
        id: screening._id,
        results: screening.results,
        recommendations: screening.recommendations
      },
      needsAppointment: screening.recommendations.specialistNeeded
    });
  } catch (error) {
    console.error('Cognitive screening error:', error);
    res.status(500).json({
      success: false,
      error: 'Screening failed'
    });
  }
});

// Get user's screening history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { type, limit = 10, page = 1 } = req.query;
    const user = await User.findOne({ supabaseId: req.userId });

    const query = { userId: user._id };
    if (type) query.type = type;

    const screenings = await Screening.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Screening.countDocuments(query);

    res.json({
      success: true,
      screenings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

// Get specific screening details
router.get('/:screeningId', authenticate, async (req, res) => {
  try {
    const screening = await Screening.findById(req.params.screeningId);

    if (!screening) {
      return res.status(404).json({
        success: false,
        error: 'Screening not found'
      });
    }

    res.json({
      success: true,
      screening
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch screening'
    });
  }
});

module.exports = router;
