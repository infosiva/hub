'use client'
import { useState, useRef, useEffect } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string }

const ACCENT = '#6366f1'

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hi, I'm HubBot. Ask me about project status, health checks, or how the dashboard works." },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply ?? 'Chat is resting — try again in a moment.' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Chat is resting — try again in a moment.' }])
    } finally {
      setLoading(false)
    }
  }

  const BOTTOM_OFFSET = 84
  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
    width: '100%', height: `calc(100dvh - ${BOTTOM_OFFSET}px)`,
    borderRadius: '16px 16px 0 0',
    background: '#0b1120', border: `1px solid rgba(99,102,241,0.25)`,
    boxShadow: '0 -8px 40px rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'hubbot-slide-bottom 0.3s cubic-bezier(0.23,1,0.32,1)',
  } : {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9998,
    width: 360, height: 500, borderRadius: 16,
    background: '#0b1120', border: `1px solid rgba(99,102,241,0.25)`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'hubbot-slide-up 0.22s ease-out',
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Open Hub assistant"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%',
          background: ACCENT, color: '#fff', border: 'none',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
          cursor: 'pointer', fontSize: 22,
          transition: 'transform 140ms cubic-bezier(0.23,1,0.32,1)',
        }}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        💬
      </button>

      {open && (
        <div style={panelStyle} role="dialog" aria-label="Hub assistant chat">
          <div style={{ flexShrink: 0, padding: '14px 16px', borderBottom: '1px solid rgba(99,102,241,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#ededed', fontWeight: 700, fontSize: 14 }}>HubBot</span>
            <button onClick={() => setOpen(false)} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%', padding: '8px 12px', borderRadius: 10,
                background: m.role === 'user' ? ACCENT : 'rgba(255,255,255,0.06)',
                color: m.role === 'user' ? '#fff' : '#ededed',
                fontSize: 13.5, lineHeight: 1.4,
              }}>
                {m.content}
              </div>
            ))}
            {loading && <div style={{ color: '#94a3b8', fontSize: 13 }}>Thinking…</div>}
          </div>

          <div style={{ flexShrink: 0, display: 'flex', gap: 8, padding: '10px 12px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))', borderTop: '1px solid rgba(99,102,241,0.2)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about a project…"
              aria-label="Chat message"
              style={{
                flex: 1, fontSize: isMobile ? 16 : 13.5, padding: '8px 10px', borderRadius: 8,
                border: '1px solid rgba(99,102,241,0.25)', background: 'rgba(255,255,255,0.04)',
                color: '#ededed', outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={loading}
              style={{
                padding: '8px 14px', borderRadius: 8, background: ACCENT, color: '#fff',
                border: 'none', fontSize: 13, fontWeight: 600, cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes hubbot-slide-up { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes hubbot-slide-bottom { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
    </>
  )
}
