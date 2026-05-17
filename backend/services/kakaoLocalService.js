const KAKAO_LOCAL_SEARCH_URL = 'https://dapi.kakao.com/v2/local/search/keyword.json';

function getKakaoRestApiKey() {
  if (!process.env.KAKAO_REST_API_KEY) {
    throw new Error('KAKAO_REST_API_KEY environment variable is required.');
  }

  return process.env.KAKAO_REST_API_KEY;
}

function normalizeDentist(document) {
  return {
    id: document.id,
    name: document.place_name,
    categoryName: document.category_name,
    phone: document.phone,
    address: document.road_address_name || document.address_name,
    placeUrl: document.place_url,
    distance: document.distance ? Number(document.distance) : null,
    latitude: Number(document.y),
    longitude: Number(document.x),
  };
}

async function searchNearbyDentists({ latitude, longitude, radius = 3000, size = 15, query = '치과' }) {
  const url = new URL(KAKAO_LOCAL_SEARCH_URL);
  url.searchParams.set('query', query.trim() || '치과');
  url.searchParams.set('x', String(longitude));
  url.searchParams.set('y', String(latitude));
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('sort', 'distance');
  url.searchParams.set('size', String(size));

  const response = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${getKakaoRestApiKey()}`,
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.message || payload?.error || '카카오 장소 검색 API 요청에 실패했습니다.';
    throw new Error(message);
  }

  return {
    dentists: Array.isArray(payload.documents) ? payload.documents.map(normalizeDentist) : [],
    meta: payload.meta || {},
  };
}

module.exports = {
  searchNearbyDentists,
};
