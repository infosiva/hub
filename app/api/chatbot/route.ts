import Groq from 'groq-sdk'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rateLimit'

let _groq: Groq | null = null
function getGroq() { if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! }); return _groq }

export const runtime = 'nodejs'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `You are HubBot, the assistant for Siva's internal portfolio ops dashboard (Hub). Hub tracks status, health, and config for ~40 side projects — deploy status, chatbot/feedback wiring, rate limits, feature flags, promo codes.

Help with: navigating the dashboard, explaining what a status/health indicator means, general questions about how the portfolio's shared systems work (Edge Config, provider fallback chains, deploy status).

You do not have live access to project data beyond what's described to you in this chat. If asked something outside Hub/portfolio-ops scope, respond: "I'm trained for Hub ops questions. For that, try Google or ChatGPT!"`

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const { ok } = checkRateLimit(`chatbot_${ip}`, 60)
    if (!ok) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

    const body = await req.json()
    const messages: Message[] = body.messages ?? []

    const groq = getGroq()
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages.slice(-6)],
    })

    const reply = completion.choices[0]?.message?.content ?? "Chat is resting — try again in a moment."
    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: "Chat is resting — try again in a moment." })
  }
}
