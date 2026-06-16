import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

interface CheckResult { name: string; pass: boolean; message?: string }

async function checkUrl(url: string): Promise<CheckResult[]> {
  const results: CheckResult[] = []

  // P1 — HTTP 200
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    results.push({ name: 'HTTP 200', pass: res.ok, message: res.ok ? undefined : `Status ${res.status}` })

    // check for H1 in HTML
    if (res.ok && res.headers.get('content-type')?.includes('html')) {
      const html = await res.text()
      const hasH1 = /<h1[\s>]/i.test(html)
      results.push({ name: 'H1 present', pass: hasH1, message: hasH1 ? undefined : 'No H1 tag found' })

      const hasMetaDesc = /name="description"/i.test(html)
      results.push({ name: 'Meta description', pass: hasMetaDesc, message: hasMetaDesc ? undefined : 'Missing meta description' })

      const hasOg = /property="og:image"/i.test(html)
      results.push({ name: 'OG image', pass: hasOg, message: hasOg ? undefined : 'Missing og:image' })

      const hasViewport = /name="viewport"/i.test(html)
      results.push({ name: 'Viewport meta', pass: hasViewport, message: hasViewport ? undefined : 'Missing viewport meta' })

      const hasChatbot = /FloatingChat|chatbot|chat-widget|data-chat/i.test(html)
      results.push({ name: 'Chatbot', pass: hasChatbot, message: hasChatbot ? undefined : 'No chatbot detected' })

      const hasFeedback = /feedback|FeedbackWidget/i.test(html)
      results.push({ name: 'Feedback', pass: hasFeedback, message: hasFeedback ? undefined : 'No feedback widget detected' })

      const hasJsonLd = /application\/ld\+json/i.test(html)
      results.push({ name: 'JSON-LD', pass: hasJsonLd, message: hasJsonLd ? undefined : 'Missing JSON-LD structured data' })

      const hasRobots = /name="robots"/i.test(html)
      results.push({ name: 'Robots meta', pass: hasRobots || !html.includes('noindex'), message: hasRobots ? undefined : undefined })
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    results.push({ name: 'HTTP 200', pass: false, message: msg })
  }

  return results
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const siteId = searchParams.get('siteId')

  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const checks = await checkUrl(url)
  const pass = checks.filter((c) => c.pass).length
  const fail = checks.filter((c) => !c.pass).length

  console.log(`[audit] ${siteId ?? url}: ${pass} pass, ${fail} fail`)

  return NextResponse.json({ pass, fail, checks, url, siteId, ts: Date.now() })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const siteId = searchParams.get('siteId')

  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const checks = await checkUrl(url)
  const pass = checks.filter((c) => c.pass).length
  const fail = checks.filter((c) => !c.pass).length

  return NextResponse.json({ pass, fail, checks, url, siteId, ts: Date.now() })
}
