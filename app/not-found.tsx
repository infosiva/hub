import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
      <div>
        <h1>Page not found</h1>
        <p>That page does not exist.</p>
        <Link href="/">Back to home</Link>
      </div>
    </main>
  )
}
