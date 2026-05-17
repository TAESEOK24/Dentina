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
    const query = typeof req.query.query === 'string' ? req.query.query : '치과';

    if (latitude === null || longitude === null) {
      return res.status(400).json({ error: 'lat과 lng 쿼리 파라미터가 필요합니다.' });
    }

    const result = await kakaoLocalService.searchNearbyDentists({
      latitude,
      longitude,
      radius: Math.min(Math.max(radius, 100), 20000),
      query,
    });

    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : '치과 검색에 실패했습니다.';
    console.error('Error in /api/dentists:', message);
    res.status(500).json({ error: '치과 검색에 실패했습니다.', detail: message });
  }
});

module.exports = router;
