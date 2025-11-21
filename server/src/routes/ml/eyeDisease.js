const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Proxy to eye disease service
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);
    if (req.body.user_id) formData.append('user_id', req.body.user_id);

    const response = await axios.post(
      `${process.env.EYE_DISEASE_API}/analyze`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Eye disease proxy error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Eye disease service unavailable'
    });
  }
});

router.get('/diseases', async (req, res) => {
  try {
    const response = await axios.get(`${process.env.EYE_DISEASE_API}/diseases`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

router.get('/disease-info/:disease', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.EYE_DISEASE_API}/disease-info/${req.params.disease}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Service unavailable' });
  }
});

module.exports = router;
