const express = require('express');
const kakaoLocalService = require('../services/kakaoLocalService');

const router = express.Router();

function parseCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

router.get('/', async (req, res) => {
  try {
    const latitude = parseCoordinate(req.query.lat);
    const longitude = parseCoordinate(req.query.lng);
    const radius = Number(req.query.radius) || 3000;

    if (latitude === null || longitude === null) {
      return res.status(400).json({ error: 'lat and lng query parameters are required.' });
    }

    const result = await kakaoLocalService.searchNearbyDentists({
      latitude,
      longitude,
      radius: Math.min(Math.max(radius, 100), 20000),
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search dentists';
    console.error('Error in /api/dentists:', message);
    res.status(500).json({ error: 'Failed to search dentists', detail: message });
  }
});

module.exports = router;
