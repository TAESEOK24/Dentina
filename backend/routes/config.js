const express = require('express');

const router = express.Router();

router.get('/kakao-map', (req, res) => {
  if (!process.env.KAKAO_JAVASCRIPT_KEY) {
    return res.status(500).json({ error: 'KAKAO_JAVASCRIPT_KEY environment variable is required.' });
  }

  res.json({
    javascriptKey: process.env.KAKAO_JAVASCRIPT_KEY,
  });
});

module.exports = router;
