import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="2" fill="white"/>
        <circle cx="5" cy="6" r="2" stroke="white" strokeWidth="1.6"/>
        <circle cx="19" cy="6" r="2" stroke="white" strokeWidth="1.6"/>
        <circle cx="5" cy="18" r="2" stroke="white" strokeWidth="1.6"/>
        <circle cx="19" cy="18" r="2" stroke="white" strokeWidth="1.6"/>
        <path d="M6.5 7.3L10.5 10.7M17.5 7.3L13.5 10.7M6.5 16.7L10.5 13.3M17.5 16.7L13.5 13.3" stroke="white" strokeWidth="1.4"/>
      </svg>
    </div>
  )
}
