// Thin wrapper around the Gemini REST API (free tier works).
// To switch providers later (Claude, OpenAI), only this file changes.

const MODEL = () => process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export async function askLLM({ system, prompt, json = false }) {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error('GEMINI_API_KEY is missing in server/.env'), { status: 500 });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL()}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        ...(json && { responseMimeType: 'application/json' }),
      },
    }),
  });

  if (!res.ok) {
    console.error('LLM error', res.status, await res.text());
    throw Object.assign(new Error('The AI service failed. Try again in a moment.'), { status: 502 });
  }

  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text).join('').trim();

  if (!json) return text;
  try {
    return JSON.parse(text.replace(/^```json|```$/g, '').trim());
  } catch {
    throw Object.assign(new Error('The AI returned an unreadable reply. Try again.'), { status: 502 });
  }
}
