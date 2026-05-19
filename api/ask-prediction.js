import { createClient } from '@supabase/supabase-js'

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { DEEPSEEK_API_KEY, SUPABASE_URL, SUPABASE_KEY } = process.env
  if (!DEEPSEEK_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: 'Server missing DEEPSEEK_API_KEY, SUPABASE_URL, or SUPABASE_KEY' })
  }

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const game_id = body?.game_id
  const question = body?.question
  if (!game_id || !question || typeof question !== 'string' || !question.trim()) {
    return res.status(400).json({ error: 'Missing game_id or question' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
  const { data: pred, error } = await supabase
    .from('game_predictions')
    .select('*')
    .eq('game_id', String(game_id))
    .maybeSingle()
  if (error) return res.status(500).json({ error: 'Supabase error: ' + error.message })
  if (!pred) return res.status(404).json({ error: 'No prediction found for that game' })

  const home = pred.home_team || pred.home || 'Home'
  const away = pred.away_team || pred.away || 'Away'
  const prob = typeof pred.home_win_prob === 'number' ? pred.home_win_prob : null
  const pick = pred.prediction || (prob !== null && prob >= 0.5 ? 'home' : 'away')
  const rationale = pred.rationale || '(no rationale recorded)'
  const pickedTeam = pick === 'home' ? home : away
  const probStr = prob !== null ? (prob * 100).toFixed(1) + '%' : 'unknown'

  const systemMsg = 'You are an NBA analyst explaining a model prediction to a fan. Be concise and grounded.'
  const userMsg = [
    'Matchup: ' + away + ' at ' + home + ' (home team: ' + home + ').',
    'Model pick: ' + pickedTeam + '. Home win probability: ' + probStr + '.',
    'Model rationale: ' + rationale,
    'Fan question: ' + question.trim(),
    'Reply in 2-3 sentences. Reference recent form, ELO, and the specific question.'
  ].join('\n')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000)
  let dsRes
  try {
    dsRes = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + DEEPSEEK_API_KEY
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 250,
        temperature: 0.5,
        messages: [
          { role: 'system', content: systemMsg },
          { role: 'user', content: userMsg }
        ]
      })
    })
  } catch (e) {
    clearTimeout(timeout)
    const msg = e?.name === 'AbortError' ? 'DeepSeek request timed out' : 'DeepSeek fetch failed: ' + (e?.message || 'unknown')
    return res.status(500).json({ error: msg })
  }
  clearTimeout(timeout)

  if (dsRes.status === 429) return res.status(500).json({ error: 'DeepSeek rate limit (429). Try again shortly.' })
  if (!dsRes.ok) {
    const text = await dsRes.text().catch(() => '')
    return res.status(500).json({ error: 'DeepSeek error ' + dsRes.status + ': ' + text.slice(0, 200) })
  }

  const json = await dsRes.json().catch(() => null)
  const answer = json?.choices?.[0]?.message?.content?.trim()
  if (!answer) return res.status(500).json({ error: 'DeepSeek returned no answer' })
  return res.status(200).json({ answer })
}
