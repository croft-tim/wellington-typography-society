import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.ts'
import appDb from '../db/connection.ts'

const LEEDS_CUBA_TOKEN = 'test-riddle-token-leeds-cuba'
const LOCKED_EXIT_ID = 23

beforeAll(async () => {
  await appDb.migrate.latest()

  await appDb('locations').insert([
    { id: 6, slug: 'leeds-cuba',   name: 'Leeds & Cuba',   description: 'Test', grid_x: 2, grid_y: 1 },
    { id: 9, slug: 'ghuznee-cuba', name: 'Ghuznee & Cuba', description: 'Test', grid_x: 2, grid_y: 2 },
  ])
  await appDb('location_tokens').insert([
    { id: 6, location_id: 6, token: LEEDS_CUBA_TOKEN },
  ])
  await appDb('exits').insert([
    { id: LOCKED_EXIT_ID, from_location_id: 6, to_location_id: 9, direction: 'south', is_locked: true },
  ])
  await appDb('riddles').insert([
    {
      id: 1,
      exit_id: LOCKED_EXIT_ID,
      question: 'What year did the Society first convene?',
      answer: '1996',
      hint: 'Mid-nineties.',
      failure_message: 'You try "{answer}". The lock does not respond.',
    },
  ])
})

afterAll(async () => {
  await appDb.destroy()
})

async function loggedInAgent(suffix = '') {
  const agent = request.agent(app)
  await agent.post('/api/auth/signup').send({
    username: `riddler${suffix}`,
    email: `riddler${suffix}@tristero.nz`,
    password: 'password123',
  })
  return agent
}

describe('POST /api/riddles/:exitId/attempt', () => {
  it('returns 401 when not logged in', async () => {
    const res = await request(app)
      .post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`)
      .send({ answer: '1996' })
    expect(res.status).toBe(401)
  })

  it('returns 404 for an exit with no riddle', async () => {
    const agent = await loggedInAgent('a')
    const res = await agent
      .post('/api/riddles/999/attempt')
      .send({ answer: 'anything' })
    expect(res.status).toBe(404)
  })

  it('returns 400 when no answer is provided', async () => {
    const agent = await loggedInAgent('b')
    const res = await agent.post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`).send({})
    expect(res.status).toBe(400)
  })

  it('returns correct: true for the right answer', async () => {
    const agent = await loggedInAgent('c')
    const res = await agent
      .post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`)
      .send({ answer: '1996' })
    expect(res.status).toBe(200)
    expect(res.body.correct).toBe(true)
  })

  it('is case-insensitive', async () => {
    const agent = await loggedInAgent('d')
    const res = await agent
      .post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`)
      .send({ answer: '  1996  ' })
    expect(res.body.correct).toBe(true)
  })

  it('records the unlock in player_unlocked_exits on success', async () => {
    const agent = await loggedInAgent('e')
    await agent.post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`).send({ answer: '1996' })

    const user = await appDb('users').where({ email: 'riddle e@tristero.nz' }).first()
    const unlock = await appDb('player_unlocked_exits')
      .where({ exit_id: LOCKED_EXIT_ID })
      .first()
    expect(unlock).toBeDefined()
  })

  it('returns correct: false with a Zork-style message for a wrong answer', async () => {
    const agent = await loggedInAgent('f')
    const res = await agent
      .post(`/api/riddles/${LOCKED_EXIT_ID}/attempt`)
      .send({ answer: 'swordfish' })
    expect(res.body.correct).toBe(false)
    expect(res.body.message).toBe('You try "swordfish". The lock does not respond.')
  })
})
