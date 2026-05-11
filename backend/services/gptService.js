const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function getGeminiApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is required.');
  }

  return process.env.GEMINI_API_KEY;
}

function parseImageData(base64Image) {
  const dataUrlMatch = base64Image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (dataUrlMatch) {
    return {
      mimeType: dataUrlMatch[1],
      data: dataUrlMatch[2],
    };
  }

  return {
    mimeType: 'image/jpeg',
    data: base64Image,
  };
}

function extractJson(text) {
  const trimmed = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Gemini response did not contain JSON.');
  }

  return JSON.parse(match[0]);
}

function normalizeAnalysisResult(result) {
  return {
    totalScore: Number.isFinite(result?.totalScore) ? result.totalScore : 78,
    cleanlinessScore: Number.isFinite(result?.cleanlinessScore) ? result.cleanlinessScore : 78,
    gumsScore: Number.isFinite(result?.gumsScore) ? result.gumsScore : 78,
    sensitivityScore: Number.isFinite(result?.sensitivityScore) ? result.sensitivityScore : 78,
    plaqueRisk: Boolean(result?.plaqueRisk),
    recommendation:
      typeof result?.recommendation === 'string' && result.recommendation.trim()
        ? result.recommendation
        : '사진이 흐리거나 구강 영역이 명확하지 않습니다. 밝은 곳에서 치아가 잘 보이도록 다시 촬영해 주세요.',
    areas: Array.isArray(result?.areas)
      ? result.areas.map((area) => ({
          position: typeof area?.position === 'string' ? area.position : '확인 필요 부위',
          score: Number.isFinite(area?.score) ? area.score : 78,
          issue: typeof area?.issue === 'string' ? area.issue : '상세 확인이 필요합니다.',
        }))
      : [],
  };
}

function fallbackAnalysisResult(rawText) {
  console.warn('Gemini returned non-JSON response:', rawText);

  return {
    totalScore: 78,
    cleanlinessScore: 78,
    gumsScore: 78,
    sensitivityScore: 78,
    plaqueRisk: false,
    recommendation: 'AI 응답 형식이 일정하지 않아 기본 점수로 표시합니다. 치아가 잘 보이도록 다시 촬영하면 더 정확한 분석이 가능합니다.',
    areas: [],
  };
}

async function analyzeImage(base64Image) {
  const { mimeType, data } = parseImageData(base64Image);

  const prompt = `You are an oral health screening assistant, not a dentist.
Analyze only visible, non-diagnostic visual cues in the uploaded mouth or teeth image.
Return only JSON that matches the schema. Do not include markdown, apologies, safety disclaimers, or extra text.
If the image is unclear, still return JSON with conservative scores and Korean guidance to retake a clearer photo.
Write recommendation and area issue text in Korean.

{
  "totalScore": 0,
  "cleanlinessScore": 0,
  "gumsScore": 0,
  "sensitivityScore": 0,
  "plaqueRisk": false,
  "recommendation": "Korean care advice in 1-2 sentences",
  "areas": [
    { "position": "tooth or gum area", "score": 0, "issue": "Korean issue summary" }
  ]
}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getGeminiApiKey(),
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              totalScore: { type: 'NUMBER' },
              cleanlinessScore: { type: 'NUMBER' },
              gumsScore: { type: 'NUMBER' },
              sensitivityScore: { type: 'NUMBER' },
              plaqueRisk: { type: 'BOOLEAN' },
              recommendation: { type: 'STRING' },
              areas: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    position: { type: 'STRING' },
                    score: { type: 'NUMBER' },
                    issue: { type: 'STRING' },
                  },
                  required: ['position', 'score', 'issue'],
                },
              },
            },
            required: [
              'totalScore',
              'cleanlinessScore',
              'gumsScore',
              'sensitivityScore',
              'plaqueRisk',
              'recommendation',
              'areas',
            ],
          },
          temperature: 0.2,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || 'Gemini API request failed.';
    throw new Error(message);
  }

  const content = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('');

  if (!content) {
    throw new Error('Gemini API returned an empty response.');
  }

  try {
    return normalizeAnalysisResult(extractJson(content));
  } catch (error) {
    return fallbackAnalysisResult(content);
  }
}

module.exports = {
  analyzeImage,
};
