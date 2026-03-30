import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import app from '../server.ts'
import appDb from '../db/connection.ts'

const LEEDS_CUBA_TOKEN = 'test-scan-token-leeds-cuba'
const GHUZNEE_CUBA_TOKEN = 'test-scan-token-ghuznee-cuba'

beforeAll(async () => {
  await appDb.migrate.latest()

  await appDb('locations').insert([
    { id: 6, slug: 'leeds-cuba',     name: 'Leeds & Cuba',     description: 'The plaza.', grid_x: 2, grid_y: 1 },
    { id: 9, slug: 'ghuznee-cuba',   name: 'Ghuznee & Cuba',   description: 'The south.', grid_x: 2, grid_y: 2 },
    { id: 5, slug: 'leeds-tory',     name: 'Leeds & Tory',     description: 'The centre.', grid_x: 1, grid_y: 1 },
  ])
  await appDb('location_tokens').insert([
    { id: 6, location_id: 6, token: LEEDS_CUBA_TOKEN },
    { id: 9, location_id: 9, token: GHUZNEE_CUBA_TOKEN },
  ])
  await appDb('exits').insert([
    { id: 8,  from_location_id: 6, to_location_id: 5, direction: 'west',  is_locked: false },
    { id: 22, from_location_id: 6, to_location_id: 5, direction: 'north', is_locked: false },
    { id: 23, from_location_id: 6, to_location_id: 9, direction: 'south', is_locked: true  },
  ])
  await appDb('riddles').insert([
    {
      id: 1,
      exit_id: 23,
      question: 'What year did the Society first convene?',
      answer: '1996',
      hint: 'Mid-nineties.',
      failure_message: 'You try "{answer}". Nothing happens.',
    },
  ])
})

afterAll(async () => {
  await appDb.destroy()
})

async function loggedInAgent(suffix = '') {
  const agent = request.agent(app)
  await agent.post('/api/auth/signup').send({
    username: `locuser${suffix}`,
    email: `locuser${suffix}@tristero.nz`,
    password: 'password123',
  })
  return agent
}

describe('GET /api/locations/:slug', () => {
  it('returns 401 when not logged in', async () => {
    const res = await request(app).get('/api/locations/leeds-cuba')
    expect(res.status).toBe(401)
  })

  it('returns 404 for an unknown slug', async () => {
    const agent = await loggedInAgent('a')
    const res = await agent.get('/api/locations/not-a-place')
    expect(res.status).toBe(404)
  })

  it('returns 403 if the player has not scanned this location', async () => {
    const agent = await loggedInAgent('b')
    const res = await agent.get('/api/locations/leeds-cuba')
    expect(res.status).toBe(403)
  })

  it('returns location data after the player scans in', async () => {
    const agent = await loggedInAgent('c')
    await agent.post(`/api/scan/${LEEDS_CUBA_TOKEN}`)

    const res = await agent.get('/api/locations/leeds-cuba')
    expect(res.status).toBe(200)
    expect(res.body.slug).toBe('leeds-cuba')
    expect(res.body.name).toBe('Leeds & Cuba')
    expect(res.body.description).toBe('The plaza.')
    expect(res.body.exits).toHaveLength(3)
  })

  it('marks the locked exit correctly with riddle question', async () => {
    const agent = await loggedInAgent('d')
    await agent.post(`/api/scan/${LEEDS_CUBA_TOKEN}`)

    const res = await agent.get('/api/locations/leeds-cuba')
    const lockedExit = res.body.exits.find((e: { direction: string }) => e.direction === 'south')

    expect(lockedExit.isLocked).toBe(true)
    expect(lockedExit.riddleQuestion).toBe('What year did the Society first convene?')
  })

  it('marks open exits as not locked', async () => {
    const agent = await loggedInAgent('e')
    await agent.post(`/api/scan/${LEEDS_CUBA_TOKEN}`)

    const res = await agent.get('/api/locations/leeds-cuba')
    const openExit = res.body.exits.find((e: { direction: string }) => e.direction === 'west')

    expect(openExit.isLocked).toBe(false)
    expect(openExit.riddleQuestion).toBeNull()
  })

  it('marks destination as visited after scanning it', async () => {
    const agent = await loggedInAgent('f')
    await agent.post(`/api/scan/${LEEDS_CUBA_TOKEN}`)
    await agent.post(`/api/scan/${GHUZNEE_CUBA_TOKEN}`)

    const res = await agent.get('/api/locations/leeds-cuba')
    const southExit = res.body.exits.find((e: { direction: string }) => e.direction === 'south')

    expect(southExit.destinationVisited).toBe(true)
  })
})
