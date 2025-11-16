import type { NextApiRequest, NextApiResponse } from 'next'
import JSZip from 'jszip'
import { parse } from 'node-html-parser'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

function parseForm(req: NextApiRequest): Promise<{fields:any, files:any}> {
  const form = formidable({ multiples: false })
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({fields, files})
    })
  })
}

async function fetchHtml(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Gagal fetch HTML')
  return await res.text()
}

function manifest() {
  return {
    name: "RikTech PWA",
    short_name: "RikTech PWA",
    start_url: ".",
    display: "standalone",
    theme_color: "#1976d2",
    background_color: "#ffffff",

    /* SPLASH SCREEN */
    screenshots: [
      {
        src: "/splash.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "wide"
      }
    ],

    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  }
}

function serviceWorker() {
  return `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fields, files } = await parseForm(req)
    const url = fields.url
    if (!url) return res.status(400).send('URL kosong')

    const html = await fetchHtml(url)
    const root = parse(html)

    const head = root.querySelector('head')
    if (head) head.appendChild(parse(`<link rel="manifest" href="/manifest.json">`))

    const body = root.querySelector('body')
    if (body) body.appendChild(parse(`<script>navigator.serviceWorker?.register('/sw.js')</script>`))

    const zip = new JSZip()

    zip.file('index.html', root.toString())
    zip.file('manifest.json', JSON.stringify(manifest(), null, 2))
    zip.file('sw.js', serviceWorker())

    const tiny = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
      'base64'
    )

    const icon192 = files.icon192 ? fs.readFileSync(files.icon192.filepath) : tiny
    const icon512 = files.icon512 ? fs.readFileSync(files.icon512.filepath) : tiny

    zip.file('icons/icon-192.png', icon192)
    zip.file('icons/icon-512.png', icon512)

    // gunakan icon 512 sebagai splash
    zip.file('splash.png', icon512)

    const out = await zip.generateAsync({ type: 'nodebuffer' })

    res.setHeader('Content-Type', 'application/zip')
    res.setHeader('Content-Disposition', `attachment; filename=riktech-pwa.zip`)
    res.send(out)

  } catch (e: any) {
    res.status(500).send(e.message)
  }
}
