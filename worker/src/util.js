export const json = (body, status, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } })

export async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Fixed-window counter in KV: true once `limit` hits in the past hour.
export async function rateLimited(env, bucket, ip, limit) {
  const key = `rl:${bucket}:${ip}`
  const n = Number((await env.MARKS.get(key)) ?? 0)
  if (n >= limit) return true
  await env.MARKS.put(key, String(n + 1), { expirationTtl: 3600 })
  return false
}

export const clientIp = (req) => req.headers.get('cf-connecting-ip') ?? 'unknown'
