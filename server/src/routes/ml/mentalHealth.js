const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/start-session', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.MENTAL_HEALTH_API}/start-session`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.MENTAL_HEALTH_API}/chat`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

router.get('/resources', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.MENTAL_HEALTH_API}/resources`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

module.exports = router;
