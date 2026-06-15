'use client'
import { useState, useEffect, useCallback } from 'react'

type Period = '1d' | '7d' | '30d' | '365d'
type SiteStat = { id: string; name: string; url: string; category: string; visitors: number; pageviews: number }

const PERIOD_LABELS: Record<Period, string> = {
  '1d': 'Last 24h',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '365d': 'Last year',
}

export default function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('7d')
  const [search, setSearch] = useState('')
  const [sites, setSites] = useState<SiteStat[]>([])
  const [loading, setLoading] = useState(true)
  const [fetched, setFetched] = useState('')

  const load = useCallback(async (p: Period) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/analytics?period=${p}`)
      const data = await res.json()
      setSites(data.sites ?? [])
      setFetched(data.fetched ? new Date(data.fetched).toLocaleTimeString() : '')
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { load(period) }, [period, load])

  const filtered = sites.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalVisitors = filtered.reduce((s, x) => s + x.visitors, 0)
  const totalPageviews = filtered.reduce((s, x) => s + x.pageviews, 0)

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Analytics</h2>
        {/* Period filter pills */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer',
                background: period === p ? '#10b981' : 'rgba(255,255,255,0.08)',
                color: period === p ? '#fff' : '#94a3b8',
                transition: 'background 0.15s',
              }}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
        {/* Search */}
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Filter by name or category..."
          style={{ flex: 1, minWidth: '180px', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', fontSize: '0.85rem' }}
        />
        {fetched && <span style={{ fontSize: '0.75rem', color: '#475569' }}>Updated {fetched}</span>}
      </div>

      {/* Summary totals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
        {[
          { label: 'Total Visitors', value: loading ? '…' : totalVisitors.toLocaleString() },
          { label: 'Total Pageviews', value: loading ? '…' : totalPageviews.toLocaleString() },
          { label: 'Active Sites', value: loading ? '…' : filtered.filter(s => s.visitors > 0).length.toString() },
        ].map(stat => (
          <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Per-site table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Site', 'Category', 'Visitors', 'Pageviews', ''].map(h => (
                <th key={h} style={{ padding: '0.6rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#475569' }}>No results</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', transition: 'background 0.1s' }}>
                <td style={{ padding: '0.6rem 1rem', fontWeight: 600, color: '#f1f5f9' }}>{s.name}</td>
                <td style={{ padding: '0.6rem 1rem', color: '#64748b' }}>{s.category}</td>
                <td style={{ padding: '0.6rem 1rem', color: '#10b981', fontWeight: 700 }}>{s.visitors.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem', color: '#94a3b8' }}>{s.pageviews.toLocaleString()}</td>
                <td style={{ padding: '0.6rem 1rem' }}>
                  <a href={s.url} target="_blank" rel="noopener" style={{ color: '#475569', fontSize: '0.75rem', textDecoration: 'none' }}>↗</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
