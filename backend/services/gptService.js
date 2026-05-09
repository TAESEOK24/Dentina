const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeImage(base64Image) {
  // data:image/jpeg;base64, 접두사가 없다면 추가
  const base64Data = base64Image.startsWith('data:image') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const prompt = `당신은 구강 건강 전문 AI입니다.
사용자가 업로드한 치아 이미지를 분석하고, 아래 JSON 형식으로만 응답하세요.
다른 텍스트나 설명은 절대 포함하지 마세요.

{
  "totalScore": (0-100 정수),
  "cleanlinessScore": (0-100 정수),
  "gumsScore": (0-100 정수),
  "sensitivityScore": (0-100 정수),
  "plaqueRisk": (true/false),
  "recommendation": "한국어로 1-2문장 관리 조언",
  "areas": [
    { "position": "치아 위치", "score": (0-100), "issue": "문제점" }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: base64Data,
            },
          },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
}

module.exports = {
  analyzeImage,
};
