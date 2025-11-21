const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { spawn } = require('child_process');

const uploadDir = path.join(__dirname, '../../uploads/cognitive-health');
if (!fs.existsSync(uploadDir)){
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// MULTIMODAL ANALYZE API
router.post(
  '/analyze',
  upload.fields([
    { name: 'eyeFeatures', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      if (!req.files.eyeFeatures || !req.files.audio) {
        return res.status(400).json({ error: 'Missing eyeFeatures or audio file' });
      }
      const eyePath = req.files.eyeFeatures[0].path;
      const audioPath = req.files.audio[0].path;
      const stats = fs.statSync(eyePath);
      console.log('eyeFeatures file size:', stats.size);
      const preview = fs.readFileSync(eyePath, { encoding: 'utf8', flag: 'r' });
      console.log('eyeFeatures content preview:', preview.substring(0, 200));

      const pythonApiUrl = 'http://localhost:5001/analyze';
      const form = new FormData();
      form.append(
        'eyeFeatures',
        fs.createReadStream(eyePath),
        req.files.eyeFeatures[0].originalname
      );
      form.append(
        'audio',
        fs.createReadStream(audioPath),
        req.files.audio[0].originalname
      );
      if (req.body.textPrompt) form.append('textPrompt', req.body.textPrompt);
      if (req.body.imageId) form.append('imageId', req.body.imageId);

      const response = await axios.post(pythonApiUrl, form, {
        headers: form.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      res.json(response.data);
      fs.unlink(eyePath, () => {});
      fs.unlink(audioPath, () => {});
    } catch (err) {
      console.error('ML Analyze error:', err.message);
      res.status(500).json({ error: 'ML service failed', message: err.message });
    }
  }
);

// PDF REPORT GENERATION (HARDENED)
router.post('/generate-report', async (req, res) => {
  try {
    let { results, userName } = req.body;
    const scriptPath = path.join(__dirname, '../../ml-services/cognitive-health/report_generator.py');

    // Defensive: handle stringified results or object
    if (typeof results === "string") {
      try {
        results = JSON.parse(results);
      } catch (e) {
        return res.status(400).json({ error: 'Malformed report payload (not JSON)' });
      }
    }
    if (!results || !results.overall_risk && (!results.results || !results.results.overall_risk)) {
      return res.status(400).json({ error: 'Malformed results input to PDF generator.' });
    }

    let pdfFile = '';
    let err = '';
    const pyProc = spawn('python', [scriptPath, JSON.stringify(results), userName || 'User']);

    pyProc.stdout.on('data', (chunk) => { pdfFile += chunk.toString().trim(); });
    pyProc.stderr.on('data', (chunk) => { err += chunk.toString(); });
    pyProc.on('close', async (code) => {
      console.log('PDF generator exited:', code, 'file:', pdfFile, 'err:', err);
      if (code !== 0 || !pdfFile || !fs.existsSync(pdfFile)) {
        return res.status(500).json({ error: 'Report generation failed', message: err || "File not found: "+pdfFile });
      }
      res.download(pdfFile, 'cognitive-health-report.pdf', async (error) => {
        if (error) console.error(error);
        try { fs.unlinkSync(pdfFile); } catch(e) {}
      });
    });
  } catch(ex) {
    res.status(500).json({ error: ex.message });
  }
});

router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    service: 'Cognitive Health ML Service',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
