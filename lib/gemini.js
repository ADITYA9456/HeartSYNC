// Gemini (gemini-2.5-flash) AI Copilot via the REST API.
import 'server-only';

const MODEL = 'gemini-2.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_BASE =
  'You are CoupleSpace Copilot, a warm, tasteful relationship assistant helping ' +
  'one partner in a couple. Be sincere, specific, and concise. Avoid clichés and ' +
  'over-the-top language. Never be cheesy or generic. Plain text only — no markdown headings.';

const FEATURE_PROMPTS = {
  date_idea: (p) =>
    `Suggest 3 thoughtful date ideas based on this context: "${p}". For each give a short title, a one-line description, and a rough vibe. Keep it practical and doable.`,
  caption: (p) =>
    `Write 4 short, original captions for a couple's shared photo described as: "${p}". Vary the tone (sweet, playful, poetic, minimal). One per line, no numbering, no hashtags unless natural.`,
  love_note: (p) =>
    `Write a heartfelt love note (4-6 sentences) conveying this sentiment: "${p}". Make it personal and genuine, in the partner's own warm voice.`,
  apology: (p) =>
    `Write a sincere, accountable apology (3-5 sentences) for this situation: "${p}". Take responsibility, validate their feelings, and offer a concrete way to make it right. No excuses.`,
  gift_idea: (p) =>
    `Suggest 5 thoughtful gift ideas for a partner based on: "${p}". For each: a name, a one-line why-it-fits, and an approximate budget tier (low/mid/splurge).`,
};

/**
 * Generate a Copilot response.
 * @returns {Promise<string>} plain-text result
 */
export async function generateCopilot(feature, prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const builder = FEATURE_PROMPTS[feature];
  if (!builder) throw new Error(`Unknown AI feature: ${feature}`);

  const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_BASE }] },
      contents: [{ role: 'user', parts: [{ text: builder(prompt) }] }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 800, topP: 0.95 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}
