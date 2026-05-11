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
  const trimmed = text.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return JSON.parse(trimmed);
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('Gemini response did not contain JSON.');
  }

  return JSON.parse(match[0]);
}

async function analyzeImage(base64Image) {
  const { mimeType, data } = parseImageData(base64Image);

  const prompt = `You are an oral health analysis assistant.
Analyze the uploaded teeth image and respond only with valid JSON.
Do not include markdown, explanations, or extra text.
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

  return extractJson(content);
}

module.exports = {
  analyzeImage,
};
