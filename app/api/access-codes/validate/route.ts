import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accessCodes } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { checkRateLimit } from '@/lib/rateLimit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { ok } = checkRateLimit(`access-codes-validate:${ip}`, 30)
  if (!ok) return NextResponse.json({ valid: false, error: 'rate limit' }, { status: 429 })

  const { code, project } = await req.json()
  if (!code) return NextResponse.json({ valid: false }, { status: 400 })

  const [row] = await db
    .select()
    .from(accessCodes)
    .where(eq(accessCodes.code, code.trim()))
    .limit(1)

  if (!row || row.revokedAt) return NextResponse.json({ valid: false })
  if (row.project && project && row.project !== project) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    daysUnlocked: row.daysUnlocked,
    feature: row.feature,
  })
}
