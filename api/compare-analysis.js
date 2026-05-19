const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-reasoner'
const TIMEOUT_MS = 25000

function fmt(n, digits = 1) {
  if (n == null || n === '') return '—'
  const num = typeof n === 'number' ? n : parseFloat(n)
  if (Number.isNaN(num)) return '—'
  return num.toFixed(digits)
}

function fmtPct(n) {
  if (n == null || n === '') return '—'
  const num = typeof n === 'number' ? n : parseFloat(n)
  if (Number.isNaN(num)) return '—'
  const display = num > 1 ? num : num * 100
  return display.toFixed(1) + '%'
}

function statLine(p) {
  return [
    `PPG ${fmt(p.ppg)}`,
    `RPG ${fmt(p.rpg)}`,
    `APG ${fmt(p.apg)}`,
    `FG% ${fmtPct(p.fg_pct)}`,
    `SPG ${fmt(p.spg)}`,
    `BPG ${fmt(p.bpg)}`,
  ].join(' · ')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing DEEPSEEK_API_KEY' })
  }

  let body = req.body
  if (typeof body === 'string') {
    try { body = JSON.parse(body) } catch { body = {} }
  }
  const players = Array.isArray(body?.players) ? body.players : []
  if (players.length < 2) {
    return res.status(400).json({ error: 'Need at least 2 players' })
  }

  const lines = players.slice(0, 4).map((p, i) => {
    const team = p.team ? ` — ${p.team}` : ''
    const pos = p.position ? ` (${p.position})` : ''
    return `${i + 1}. ${p.player_name || 'Unknown'}${pos}${team}\n   ${statLine(p)}`
  }).join('\n')

  const prompt = (
    `Compare these NBA players on the chart stats below. Write 3-4 sentences total. ` +
    `Cover: who is the better scorer, who is the better playmaker/rebounder/defender, ` +
    `and one situation each player is better suited for. No fluff, no preamble.\n\n` +
    lines
  )

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 350,
        temperature: 0.5,
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (resp.status === 429) {
      return res.status(429).json({ error: 'DeepSeek rate limited, try again in a moment' })
    }
    if (!resp.ok) {
      const text = await resp.text()
      return res.status(502).json({ error: `DeepSeek ${resp.status}: ${text.slice(0, 200)}` })
    }

    const data = await resp.json()
    const analysis = data?.choices?.[0]?.message?.content?.trim() || ''
    if (!analysis) {
      return res.status(502).json({ error: 'DeepSeek returned empty response' })
    }
    return res.status(200).json({ analysis })
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'DeepSeek took too long' })
    }
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}
