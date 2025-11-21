const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/ask', async (req, res) => {
  try {
    const response = await axios.post(
      `${process.env.PUBLIC_HEALTH_API}/ask`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

router.get('/topics', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.PUBLIC_HEALTH_API}/topics`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

router.get('/emergency-numbers', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.PUBLIC_HEALTH_API}/emergency-numbers`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

module.exports = router;
