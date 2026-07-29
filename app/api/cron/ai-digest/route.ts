/**
 * Vercel Cron: AI Daily Digest → Telegram (@LetsLearnAIBot)
 * Schedule set in vercel.json. Protected by CRON_SECRET env var (same pattern as /api/cron/health).
 *
 * Each run: picks the next topic in the curriculum sequence for the configured level,
 * generates an explanation + example via the free AI cascade, looks up a real YouTube
 * video, sends it to Telegram — prefixed with a recall-quiz recap of the previous topic.
 */
import { NextRequest, NextResponse } from 'next/server'
import { aiChat } from '@/lib/aiCascade'
import { getDigestState, updateDigestState } from '@/lib/aiDigestState'
import { getTopic, topicCount } from '@/lib/aiDigestTopics'

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_AI_DIGEST_BOT_TOKEN ?? ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_AI_DIGEST_CHAT_ID ?? ''
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY ?? ''

async function sendTelegram(text: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[ai-digest] TELEGRAM_AI_DIGEST_BOT_TOKEN or CHAT_ID missing — skipping send')
    return false
  }
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: false }),
  })
  return res.ok
}

async function findYouTubeVideo(topic: string): Promise<{ title: string; url: string } | null> {
  if (!YOUTUBE_API_KEY) return null
  try {
    const p = new URLSearchParams({
      part: 'snippet',
      q: `${topic} explained`,
      type: 'video',
      maxResults: '1',
      relevanceLanguage: 'en',
      safeSearch: 'strict',
      key: YOUTUBE_API_KEY,
    })
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${p}`)
    if (!res.ok) return null
    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null
    return { title: item.snippet.title, url: `https://www.youtube.com/watch?v=${item.id.videoId}` }
  } catch {
    return null
  }
}

async function generateDigest(topic: string, level: string): Promise<{ explanation: string; quizQuestion: string; quizAnswer: string }> {
  const system = `You are an AI/ML teacher writing a single daily lesson for a ${level}-level learner. Be clear, concrete, and concise — no fluff, no headers, no markdown bold. Always include one small example (a plain-English scenario or short code snippet if relevant).`
  const prompt = `Topic: "${topic}"

Write:
1. A well-written paragraph (100-150 words) explaining this topic clearly for a ${level} learner, including one concrete example.
2. One short recall question (a single sentence) testing understanding of THIS topic, to be asked tomorrow.
3. The one-sentence answer to that question.

Respond in exactly this format, no extra text:
EXPLANATION: <paragraph>
QUESTION: <question>
ANSWER: <answer>`

  const raw = await aiChat([
    { role: 'system', content: system },
    { role: 'user', content: prompt },
  ], 600)

  const explanation = raw.match(/EXPLANATION:\s*([\s\S]*?)(?=\nQUESTION:|$)/)?.[1]?.trim() ?? raw.trim()
  const quizQuestion = raw.match(/QUESTION:\s*([\s\S]*?)(?=\nANSWER:|$)/)?.[1]?.trim() ?? ''
  const quizAnswer = raw.match(/ANSWER:\s*([\s\S]*)$/)?.[1]?.trim() ?? ''

  return { explanation, quizQuestion, quizAnswer }
}

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const state = await getDigestState()

  const today = new Date().toISOString().slice(0, 10)
  const sentSoFarToday = state.lastSentDate === today ? state.sentToday : 0
  if (sentSoFarToday >= state.freq) {
    return NextResponse.json({ sent: false, skipped: 'freq limit reached for today', freq: state.freq, sentSoFarToday })
  }

  const nextIndex = state.lastTopicIndex + 1
  const topic = getTopic(state.level, nextIndex)
  const cycled = nextIndex >= topicCount(state.level)

  const [{ explanation, quizQuestion, quizAnswer }, video] = await Promise.all([
    generateDigest(topic, state.level),
    findYouTubeVideo(topic),
  ])

  const parts: string[] = []
  if (state.lastTopic && state.lastAnswer) {
    parts.push(`🧠 <b>Yesterday's recall</b>\nYou learned about "${state.lastTopic}". Quick check: ${state.lastAnswer}`)
  }
  parts.push(`📚 <b>Day ${nextIndex + 1} — ${state.level.toUpperCase()}</b>\n<b>${topic}</b>${cycled ? ' (revisiting — you\'ve completed this level once)' : ''}\n\n${explanation}`)
  if (video) {
    parts.push(`🎥 ${video.title}\n${video.url}`)
  }
  if (quizQuestion) {
    parts.push(`❓ <i>Tomorrow's recall check:</i> ${quizQuestion}`)
  }

  const message = parts.join('\n\n')
  const sent = await sendTelegram(message)

  await updateDigestState({
    lastTopicIndex: nextIndex % topicCount(state.level),
    lastTopic: topic,
    lastAnswer: quizAnswer || null,
    lastSentDate: today,
    sentToday: sentSoFarToday + 1,
  })

  return NextResponse.json({
    sent,
    topic,
    level: state.level,
    index: nextIndex,
    hadVideo: !!video,
  })
}
