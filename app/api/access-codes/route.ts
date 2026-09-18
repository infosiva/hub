import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { accessCodes } from '@/lib/schema'
import { desc, eq } from 'drizzle-orm'

const PASSWORD = process.env.DASHBOARD_PASSWORD ?? 'siva2026'

function isAdmin(req: NextRequest) {
  return req.cookies.get('hub_auth')?.value === PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const rows = await db.select().from(accessCodes).orderBy(desc(accessCodes.createdAt))
  return NextResponse.json({ codes: rows })
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { code, project, daysUnlocked, feature } = await req.json()
  if (!code || !daysUnlocked) {
    return NextResponse.json({ error: 'code and daysUnlocked required' }, { status: 400 })
  }
  const [row] = await db
    .insert(accessCodes)
    .values({ code, project: project || null, daysUnlocked, feature: feature || 'pro' })
    .returning()
  return NextResponse.json({ code: row })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await db.update(accessCodes).set({ revokedAt: new Date() }).where(eq(accessCodes.id, id))
  return NextResponse.json({ ok: true })
}
