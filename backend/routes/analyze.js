const express = require('express');
const router = express.Router();
const gptService = require('../services/gptService');

router.post('/', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 field is required' });
    }

    const result = await gptService.analyzeImage(imageBase64);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to analyze image';
    console.error('Error in /api/analyze:', message);
    res.status(500).json({ error: 'Failed to analyze image', detail: message });
  }
});

module.exports = router;
