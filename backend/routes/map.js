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

function createMapHtml({ javascriptKey, latitude, longitude, dentists, selectedDentistId, focus }) {
  const safeDentists = JSON.stringify(dentists).replace(/</g, '\\u003c');
  const safeSelectedDentistId = JSON.stringify(selectedDentistId || '');

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
      .label.selected { border-color: #3b5bff; color: #3b5bff; box-shadow: 0 10px 22px rgba(59, 91, 255, 0.22); }
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
      const initialSelectedDentistId = ${safeSelectedDentistId};
      const userLocation = { latitude: ${latitude}, longitude: ${longitude} };
      const overlayById = {};
      let mapInstance = null;
      let selectedOverlay = null;

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

      function postMapClick(latLng) {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapClick',
          latitude: latLng.getLat(),
          longitude: latLng.getLng()
        }));
      }

      function labelContent(dentist, selected) {
        return '<div class="label ' + (selected ? 'selected' : '') + '">' +
          escapeHtml(dentist.name) +
          '<span>' + escapeHtml(formatDistance(dentist.distance)) + '</span></div>';
      }

      function selectDentist(dentistId, shouldPost) {
        const dentist = dentists.find(function (item) { return String(item.id) === String(dentistId); });
        if (!dentist || !mapInstance || !overlayById[dentist.id]) return;

        if (selectedOverlay) {
          selectedOverlay.setMap(null);
        }

        const position = new kakao.maps.LatLng(dentist.latitude, dentist.longitude);
        const overlay = overlayById[dentist.id];
        overlay.setContent(labelContent(dentist, true));
        overlay.setMap(mapInstance);
        selectedOverlay = overlay;
        mapInstance.panTo(position);

        if (shouldPost) {
          postDentist(dentist);
        }
      }

      window.onerror = function (message) {
        showFallback('카카오 지도를 불러오지 못했습니다. 등록된 Web 도메인을 확인해 주세요.');
      };

      if (!window.kakao || !kakao.maps) {
        showFallback('카카오 지도 스크립트를 불러오지 못했습니다.');
      } else {
        kakao.maps.load(function () {
          const center = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
          const map = new kakao.maps.Map(document.getElementById('map'), { center, level: 4 });
          mapInstance = map;
          const bounds = new kakao.maps.LatLngBounds();
          bounds.extend(center);

          new kakao.maps.CustomOverlay({
            position: center,
            content: '<div class="current"></div>',
            yAnchor: 0.5,
            xAnchor: 0.5,
            map
          });

          kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
            postMapClick(mouseEvent.latLng);
          });

          dentists.forEach(function (dentist) {
            const position = new kakao.maps.LatLng(dentist.latitude, dentist.longitude);
            const marker = new kakao.maps.Marker({ position, map });
            const overlay = new kakao.maps.CustomOverlay({
              position,
              content: labelContent(dentist, String(dentist.id) === String(initialSelectedDentistId)),
              yAnchor: 1.55
            });

            overlayById[dentist.id] = overlay;
            bounds.extend(position);
            kakao.maps.event.addListener(marker, 'click', function () {
              selectDentist(dentist.id, true);
            });
          });

          if (dentists.length > 0 && ${JSON.stringify(focus)} !== 'me') {
            map.setBounds(bounds);
          }

          if (${JSON.stringify(focus)} === 'me') {
            map.setLevel(4);
            map.panTo(center);
          }

          if (initialSelectedDentistId) {
            setTimeout(function () {
              selectDentist(initialSelectedDentistId, false);
            }, 350);
          }

          function handleNativeMessage(event) {
            try {
              const payload = JSON.parse(event.data);
              if (payload.type === 'selectDentist') {
                selectDentist(payload.dentistId, false);
              }
            } catch (error) {}
          }

          document.addEventListener('message', handleNativeMessage);
          window.addEventListener('message', handleNativeMessage);
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
    const query = typeof req.query.query === 'string' ? req.query.query : '치과';
    const selectedDentistId = typeof req.query.selected === 'string' ? req.query.selected : '';
    const focus = typeof req.query.focus === 'string' ? req.query.focus : '';

    if (latitude === null || longitude === null) {
      return res.status(400).send('lat과 lng 쿼리 파라미터가 필요합니다.');
    }

    if (!process.env.KAKAO_JAVASCRIPT_KEY) {
      return res.status(500).send('KAKAO_JAVASCRIPT_KEY environment variable is required.');
    }

    const result = await kakaoLocalService.searchNearbyDentists({
      latitude,
      longitude,
      radius: Math.min(Math.max(radius, 100), 20000),
      query,
    });

    res.type('html').send(
      createMapHtml({
        javascriptKey: process.env.KAKAO_JAVASCRIPT_KEY,
        latitude,
        longitude,
        dentists: result.dentists,
        selectedDentistId,
        focus,
      }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '지도를 렌더링하지 못했습니다.';
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
    const message = error instanceof Error ? error.message : '카카오 지도 SDK를 불러오지 못했습니다.';
    console.error('Error in /map/kakao-sdk.js:', message);
    res.status(500).type('text/javascript').send(`console.error(${JSON.stringify(message)});`);
  }
});

module.exports = router;
