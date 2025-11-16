import React, { useState } from 'react'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.target)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: formData
      })

      if (!res.ok) throw new Error(await res.text())

      const blob = await res.blob()
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `riktech-pwa.zip`
      a.click()
    } catch (err: any) {
      setError(err.message)
    }

    setLoading(false)
  }

  return (
    <main
      style={{
        maxWidth: 900,
        margin: '3rem auto',
        padding: '2rem',
        background: '#ffffff',
        borderRadius: 20,
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
        animation: 'fadeIn 0.6s ease'
      }}
    >

      <style>{`
        @keyframes fadeIn {
          from {opacity:0; transform: translateY(20px);}
          to {opacity:1; transform: translateY(0);}
        }
        .hoverBtn:hover {
          transform: scale(1.04);
          box-shadow: 0 10px 25px rgba(0,0,0,0.18);
        }
      `}</style>

      <h1 style={{fontSize: '2.5rem', fontWeight: 800}}>🚀 RikTech PWA Generator</h1>
      <p style={{opacity:0.8}}>Konversi website statis menjadi Progressive Web App dalam hitungan detik.</p>

      {/* Splash meta tags */}
      <meta name="theme-color" content="#1976d2" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      <form onSubmit={handleSubmit} style={{display:'grid', gap:20}}>

        <label><b>Masukkan URL Website</b></label>
        <input
          name="url"
          required
          value={url}
          onChange={e=>setUrl(e.target.value)}
          placeholder="https://example.com"
          style={{
            padding:12,
            fontSize:16,
            borderRadius:10,
            border:'1px solid #ddd'
          }}
        />

        <label><b>Upload Icon 192x192 (PNG)</b></label>
        <input name="icon192" type="file" accept="image/png" />

        <label><b>Upload Icon 512x512 (PNG)</b></label>
        <input name="icon512" type="file" accept="image/png" />

        <button
          className="hoverBtn"
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 20px',
            background:'#1976d2',
            color:'#fff',
            border:'none',
            borderRadius:10,
            fontSize:16,
            cursor:'pointer',
            transition:'0.2s'
          }}
        >
          {loading ? 'Memproses...' : 'Generate PWA'}
        </button>
      </form>

      {error && <p style={{color:'red', marginTop:20}}>{error}</p>}

      <hr style={{margin:'30px 0'}} />

      <h3>Developer Info</h3>
      <p>
        <b>Thoriq Ichsani</b>, 20 Tahun — Temanggung<br/>
        📧 rikdevappstore@gmail.com<br/>
        📱 081917651057
      </p>
    </main>
  )
}
