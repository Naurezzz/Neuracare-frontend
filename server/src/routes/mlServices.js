const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ML Service URLs
const ML_SERVICES = {
    eyeDisease: process.env.EYE_DISEASE_API || 'http://localhost:8001',
    mentalHealth: process.env.MENTAL_HEALTH_API || 'http://localhost:8002',
    publicHealth: process.env.PUBLIC_HEALTH_API || 'http://localhost:8003',
    cognitiveHealth: process.env.COGNITIVE_HEALTH_API || 'http://localhost:8004'
};

// ============================================================
// EYE DISEASE ROUTES
// ============================================================

// Analyze eye image
router.post('/eye-disease/analyze', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Call ML service
        const response = await axios.post(
            `${ML_SERVICES.eyeDisease}/analyze`,
            formData,
            {
                headers: formData.getHeaders(),
                maxBodyLength: Infinity,
                maxContentLength: Infinity
            }
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Eye disease analysis error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// Get eye disease service info
router.get('/eye-disease/info', async (req, res) => {
    try {
        const response = await axios.get(ML_SERVICES.eyeDisease);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============================================================
// MENTAL HEALTH ROUTES
// ============================================================

// Classify message intent
router.post('/mental-health/classify', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await axios.post(
            `${ML_SERVICES.mentalHealth}/classify`,
            { text }
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Mental health classification error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// Update mental health chat route
router.post('/mental-health/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Call new chat endpoint with context
        const response = await axios.post(
            `${ML_SERVICES.mentalHealth}/chat`,
            { 
                text: message,
                use_context: true 
            }
        );

        res.json({
            success: true,
            ...response.data
        });

    } catch (error) {
        console.error('Mental health chat error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// Add feedback route
router.post('/mental-health/feedback', async (req, res) => {
    try {
        const { conversation_id, rating, helpful, comment } = req.body;

        const response = await axios.post(
            `${ML_SERVICES.mentalHealth}/feedback`,
            { conversation_id, rating, helpful, comment }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add learning stats route
router.get('/mental-health/stats', async (req, res) => {
    try {
        const response = await axios.get(
            `${ML_SERVICES.mentalHealth}/learning/stats`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ============================================================
// PUBLIC HEALTH ROUTES
// ============================================================

// Ask health question (RAG)
router.post('/public-health/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        const response = await axios.post(
            `${ML_SERVICES.publicHealth}/ask`,
            { question }
        );

        res.json({
            success: true,
            answer: response.data.answer,
            source: response.data.source
        });

    } catch (error) {
        console.error('Public health ask error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// Get COVID stats
router.get('/public-health/covid/:country', async (req, res) => {
    try {
        const { country } = req.params;
        
        const response = await axios.get(
            `${ML_SERVICES.publicHealth}/covid/${country}`
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('COVID stats error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// Get health news
router.get('/public-health/news', async (req, res) => {
    try {
        const { query = 'health India' } = req.query;
        
        const response = await axios.get(
            `${ML_SERVICES.publicHealth}/news`,
            { params: { query } }
        );

        res.json({
            success: true,
            articles: response.data.articles
        });

    } catch (error) {
        console.error('Health news error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// ============================================================
// COGNITIVE HEALTH ROUTES
// ============================================================

// Analyze dyslexia from eye-tracking data
router.post('/cognitive-health/dyslexia', async (req, res) => {
    try {
        const features = req.body;

        // Validate required fields
        const requiredFields = [
            'fixation_duration_ms',
            'saccade_amplitude',
            'regression_rate',
            'reading_speed_wpm',
            'fixation_count',
            'blink_rate',
            'pupil_diameter_mm'
        ];

        for (const field of requiredFields) {
            if (features[field] === undefined) {
                return res.status(400).json({ 
                    error: `Missing required field: ${field}` 
                });
            }
        }

        const response = await axios.post(
            `${ML_SERVICES.cognitiveHealth}/dyslexia/analyze`,
            features
        );

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Dyslexia analysis error:', error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.detail || error.message
        });
    }
});

// ============================================================
// HEALTH CHECK
// ============================================================

// Check all ML services status
router.get('/health', async (req, res) => {
    const services = [];

    for (const [name, url] of Object.entries(ML_SERVICES)) {
        try {
            const response = await axios.get(`${url}/health`, { timeout: 5000 });
            services.push({
                name,
                status: 'healthy',
                url,
                data: response.data
            });
        } catch (error) {
            services.push({
                name,
                status: 'unhealthy',
                url,
                error: error.message
            });
        }
    }

    const allHealthy = services.every(s => s.status === 'healthy');

    res.json({
        overall_status: allHealthy ? 'healthy' : 'degraded',
        services,
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
