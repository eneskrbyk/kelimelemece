// api/check-drawing.js
// Bu dosyayı projenin "api" klasörüne koy

export default async function handler(req, res) {
  // Sadece POST isteği kabul et
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }

  const { image, word } = req.body;
  // image = canvas'tan gelen base64 resim
  // word  = kullanıcının çizmesi gereken kelime (örn: "ELMA")

  if (!image || !word) {
    return res.status(400).json({ error: 'image ve word zorunlu' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY, // Vercel'de güvenle saklanan anahtar
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/png',
                  data: image // base64 veri buraya
                }
              },
              {
                type: 'text',
                // Claude'a çok net ve kısa soru soruyoruz
                text: `Bu çizim "${word}" kelimesiyle ilgili mi? 
                Sadece EVET veya HAYIR yaz, başka hiçbir şey yazma.`
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    const answer = data.content[0].text.trim().toUpperCase();
    const isCorrect = answer.includes('EVET');

    return res.status(200).json({ correct: isCorrect });

  } catch (err) {
    console.error('Claude API hatası:', err);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}
