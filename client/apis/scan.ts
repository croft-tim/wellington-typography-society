import request from 'superagent'

export async function scanToken(token: string): Promise<{ slug: string }> {
  const res = await request.post(`/api/scan/${token}`)
  return res.body
}
