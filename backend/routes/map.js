const express = require('express');
const kakaoLocalService = require('../services/kakaoLocalService');

const router = express.Router();
const KAKAO_MAP_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

function parseCoordinate(value) {
  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createMapHtml({ javascriptKey, latitude, longitude, dentists }) {
  const safeDentists = JSON.stringify(dentists).replace(/</g, '\\u003c');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #e9edf7; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .current {
        width: 18px;
        height: 18px;
        border: 4px solid #fff;
        border-radius: 50%;
        background: #3b5bff;
        box-shadow: 0 0 0 7px rgba(59, 91, 255, 0.18), 0 4px 12px rgba(0,0,0,0.18);
      }
      .label {
        min-width: 124px;
        padding: 8px 10px;
        border: 1px solid rgba(255, 107, 157, 0.28);
        border-radius: 12px;
        background: #fff;
        color: #1a1a2e;
        box-shadow: 0 8px 18px rgba(21, 25, 54, 0.14);
        font-size: 12px;
        font-weight: 800;
        line-height: 1.35;
        white-space: nowrap;
      }
      .label span { display: block; margin-top: 2px; color: #727789; font-size: 11px; font-weight: 700; }
      .fallback {
        position: absolute;
        left: 16px;
        right: 16px;
        top: 16px;
        z-index: 10;
        padding: 12px 14px;
        border-radius: 14px;
        background: #fff;
        color: #1a1a2e;
        box-shadow: 0 8px 18px rgba(21, 25, 54, 0.12);
        font-size: 13px;
        font-weight: 800;
      }
    </style>
    <script src="/map/kakao-sdk.js"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const dentists = ${safeDentists};
      const userLocation = { latitude: ${latitude}, longitude: ${longitude} };

      function escapeHtml(value) {
        return String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

      function formatDistance(distance) {
        if (!distance) return '';
        return distance >= 1000 ? (distance / 1000).toFixed(1) + 'km' : distance + 'm';
      }

      function showFallback(message) {
        const node = document.createElement('div');
        node.className = 'fallback';
        node.textContent = message;
        document.body.appendChild(node);
      }

      function postDentist(dentist) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'dentist',
          dentist
        }));
      }

      window.onerror = function (message) {
        showFallback('Kakao map failed to load. Check the registered Web domain.');
      };

      if (!window.kakao || !kakao.maps) {
        showFallback('Kakao map script is unavailable.');
      } else {
        kakao.maps.load(function () {
          const center = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
          const map = new kakao.maps.Map(document.getElementById('map'), { center, level: 4 });
          const bounds = new kakao.maps.LatLngBounds();
          bounds.extend(center);

          new kakao.maps.CustomOverlay({
            position: center,
            content: '<div class="current"></div>',
            yAnchor: 0.5,
            xAnchor: 0.5,
            map
          });

          dentists.forEach(function (dentist) {
            const position = new kakao.maps.LatLng(dentist.latitude, dentist.longitude);
            const marker = new kakao.maps.Marker({ position, map });
            const overlay = new kakao.maps.CustomOverlay({
              position,
              content: '<div class="label">' + escapeHtml(dentist.name) + '<span>' + escapeHtml(formatDistance(dentist.distance)) + '</span></div>',
              yAnchor: 1.55
            });

            bounds.extend(position);
            kakao.maps.event.addListener(marker, 'click', function () {
              overlay.setMap(map);
              postDentist(dentist);
            });
          });

          if (dentists.length > 0) {
            map.setBounds(bounds);
          }
        });
      }
    </script>
  </body>
</html>`;
}

router.get('/dentists', async (req, res) => {
  try {
    const latitude = parseCoordinate(req.query.lat);
    const longitude = parseCoordinate(req.query.lng);
    const radius = Number(req.query.radius) || 3000;

    if (latitude === null || longitude === null) {
      return res.status(400).send('lat and lng query parameters are required.');
    }

    if (!process.env.KAKAO_JAVASCRIPT_KEY) {
      return res.status(500).send('KAKAO_JAVASCRIPT_KEY environment variable is required.');
    }

    const result = await kakaoLocalService.searchNearbyDentists({
      latitude,
      longitude,
      radius: Math.min(Math.max(radius, 100), 20000),
    });

    res.type('html').send(
      createMapHtml({
        javascriptKey: process.env.KAKAO_JAVASCRIPT_KEY,
        latitude,
        longitude,
        dentists: result.dentists,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to render map';
    console.error('Error in /map/dentists:', message);
    res.status(500).send(message);
  }
});

router.get('/kakao-sdk.js', async (req, res) => {
  try {
    if (!process.env.KAKAO_JAVASCRIPT_KEY) {
      return res.status(500).type('text/javascript').send('console.error("KAKAO_JAVASCRIPT_KEY is required.");');
    }

    const url = new URL(KAKAO_MAP_SDK_URL);
    url.searchParams.set('appkey', process.env.KAKAO_JAVASCRIPT_KEY);
    url.searchParams.set('autoload', 'false');

    const response = await fetch(url);
    const script = await response.text();

    if (!response.ok) {
      return res.status(response.status).type('text/javascript').send(script);
    }

    res
      .set('Cache-Control', 'public, max-age=300')
      .type('text/javascript')
      .send(script);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load Kakao SDK';
    console.error('Error in /map/kakao-sdk.js:', message);
    res.status(500).type('text/javascript').send(`console.error(${JSON.stringify(message)});`);
  }
});

module.exports = router;
