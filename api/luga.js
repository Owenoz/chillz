// Vercel Serverless Function — proxies LugaFlix API to fix CORS
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  if (req.method === 'OPTIONS') { res.status(200).end(); return }

  const { page = 1, per_page = 40, search = '' } = req.query
  const url = `https://movies.mruodel.com/api/movies?page=${page}&per_page=${per_page}`

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!upstream.ok) { res.status(upstream.status).json({ error: 'upstream error' }); return }
    const data = await upstream.json()
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
