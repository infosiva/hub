"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (res.ok) {
      router.push(params.get("from") ?? "/");
    } else {
      setErr(true);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '320px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: '#3b82f6', marginBottom: 12 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>Ops Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: 4 }}>Internal tools access</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setErr(false); }}
                style={{ width: '100%', padding: '10px 14px', fontSize: '14px', border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none', color: '#0f172a', background: '#fff', boxSizing: 'border-box', transition: 'border-color 160ms ease' }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>
            {err && <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>Wrong password</p>}
            <button
              type="submit"
              style={{ width: '100%', padding: '11px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 160ms ease, transform 100ms ease' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2563eb')}
              onMouseLeave={e => (e.currentTarget.style.background = '#3b82f6')}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
