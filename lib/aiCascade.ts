// Minimal free-tier AI cascade for hub cron jobs: Groq → Gemini → Cerebras.
// Not the full ai-platform-template/lib/ai.ts (no Ollama, no Anthropic paid fallback,
// no vertical.config dependency) — hub is not a vertical, just needs cheap/free text gen.

type Msg = { role: 'system' | 'user' | 'assistant'; content: string }

async function callGroq(messages: Msg[], maxTokens: number): Promise<string | null> {
  const key = process.env.GROQ_API_KEY
  if (!key) return null
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages, max_tokens: maxTokens, temperature: 0.7 }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? null
}

async function callGemini(messages: Msg[], maxTokens: number): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY
  if (!key) return null
  const system = messages.find(m => m.role === 'system')?.content
  const contents = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null
}

async function callCerebras(messages: Msg[], maxTokens: number): Promise<string | null> {
  const key = process.env.CEREBRAS_API_KEY
  if (!key) return null
  const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-oss-120b', messages, max_tokens: maxTokens, temperature: 0.7 }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? null
}

export async function aiChat(messages: Msg[], maxTokens = 700): Promise<string> {
  for (const call of [callGroq, callGemini, callCerebras]) {
    try {
      const text = await call(messages, maxTokens)
      if (text) return text
    } catch {
      // try next provider
    }
  }
  throw new Error('All AI providers (Groq, Gemini, Cerebras) exhausted or unset')
}
