import { NextRequest, NextResponse } from 'next/server'
import { getDigestState, updateDigestState } from '@/lib/aiDigestState'

export const runtime = 'nodejs'

export async function GET() {
  const state = await getDigestState()
  return NextResponse.json(state)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const patch: { freq?: number; level?: 'beginner' | 'intermediate' | 'advanced' } = {}
  if (typeof body.freq === 'number' && body.freq >= 1 && body.freq <= 3) patch.freq = body.freq
  if (['beginner', 'intermediate', 'advanced'].includes(body.level)) patch.level = body.level
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: 'freq (1-3) or level required' }, { status: 400 })
  }
  const ok = await updateDigestState(patch)
  if (!ok) return NextResponse.json({ error: 'Edge Config write failed' }, { status: 500 })
  return NextResponse.json({ ok: true, ...patch })
}
