import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.ts'
import appDb from '../db/connection.ts'

const TEST_TOKEN = 'test-token-0000-0000-0000-000000000006' // leeds-cuba

beforeAll(async () => {
  await appDb.migrate.latest()

  // Seed minimal game data needed for scan tests
  await appDb('locations').insert([
    { id: 6, slug: 'leeds-cuba', name: 'Leeds & Cuba', description: 'Test', grid_x: 2, grid_y: 1 },
    { id: 9, slug: 'ghuznee-cuba', name: 'Ghuznee & Cuba', description: 'Test', grid_x: 2, grid_y: 2 },
  ])
  await appDb('location_tokens').insert([
    { id: 6, location_id: 6, token: TEST_TOKEN },
  ])
})

afterAll(async () => {
  await appDb.destroy()
})

// Helper: sign up and return an agent with an active session
async function loggedInAgent(suffix = '') {
  const agent = request.agent(app)
  await agent.post('/api/auth/signup').send({
    username: `scanner${suffix}`,
    email: `scanner${suffix}@tristero.nz`,
    password: 'password123',
  })
  return agent
}

describe('POST /api/scan/:token', () => {
  it('returns 401 when not logged in', async () => {
    const res = await request(app).post(`/api/scan/${TEST_TOKEN}`)
    expect(res.status).toBe(401)
  })

  it('returns 404 for an unknown token', async () => {
    const agent = await loggedInAgent('a')
    const res = await agent.post('/api/scan/not-a-real-token')
    expect(res.status).toBe(404)
  })

  it('returns the location slug on a valid scan', async () => {
    const agent = await loggedInAgent('b')
    const res = await agent.post(`/api/scan/${TEST_TOKEN}`)
    expect(res.status).toBe(200)
    expect(res.body.slug).toBe('leeds-cuba')
  })

  it('records the visit in player_visited_locations', async () => {
    const agent = await loggedInAgent('c')
    await agent.post(`/api/scan/${TEST_TOKEN}`)

    const user = await appDb('users').where({ email: 'scannerc@tristero.nz' }).first()
    const visit = await appDb('player_visited_locations')
      .where({ user_id: user.id, location_id: 6 })
      .first()

    expect(visit).toBeDefined()
    expect(visit.token_used).toBe(TEST_TOKEN)
  })

  it('sets player progress to the scanned location', async () => {
    const agent = await loggedInAgent('d')
    await agent.post(`/api/scan/${TEST_TOKEN}`)

    const user = await appDb('users').where({ email: 'scannerd@tristero.nz' }).first()
    const progress = await appDb('player_progress').where({ user_id: user.id }).first()

    expect(progress).toBeDefined()
    expect(progress.current_location_id).toBe(6)
  })

  it('does not duplicate the visit record on a second scan', async () => {
    const agent = await loggedInAgent('e')
    await agent.post(`/api/scan/${TEST_TOKEN}`)
    await agent.post(`/api/scan/${TEST_TOKEN}`)

    const user = await appDb('users').where({ email: 'scannere@tristero.nz' }).first()
    const visits = await appDb('player_visited_locations').where({
      user_id: user.id,
      location_id: 6,
    })

    expect(visits).toHaveLength(1)
  })
})
