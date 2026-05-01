module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST kabul edilir' });
  }

  const { image, word } = req.body;

  if (!image || !word) {
    return res.status(400).json({ error: 'image ve word zorunlu' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: 'image/png',
                  data: image
                }
              },
              {
                text: `Bu çizim "${word}" kelimesiyle ilgili mi? Sadece EVET veya HAYIR yaz.`
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    
    // Hata ayıklama için tam cevabı logla
    console.log('Gemini cevabı:', JSON.stringify(data));

    // Güvenli okuma
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() || '';
    const isCorrect = answer.includes('EVET');

    return res.status(200).json({ correct: isCorrect, answer });

  } catch (err) {
    console.error('Gemini API hatası:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
