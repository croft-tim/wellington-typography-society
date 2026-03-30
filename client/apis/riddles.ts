import request from 'superagent'

export interface AttemptResult {
  correct: boolean
  message?: string
}

export async function attemptRiddle(exitId: number, answer: string): Promise<AttemptResult> {
  const res = await request.post(`/api/riddles/${exitId}/attempt`).send({ answer })
  return res.body
}
