import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { db, setupTestDb, teardownTestDb } from './helpers.ts'

beforeAll(setupTestDb)
afterAll(teardownTestDb)

describe('locations seed data', () => {
  it('has 9 locations', async () => {
    const locations = await db('locations').select()
    expect(locations).toHaveLength(9)
  })

  it('includes the starting node leeds-cuba at the correct grid position', async () => {
    const location = await db('locations').where({ slug: 'leeds-cuba' }).first()
    expect(location).toBeDefined()
    expect(location.grid_x).toBe(2)
    expect(location.grid_y).toBe(1)
  })

  it('has 24 exits covering the full 3x3 grid', async () => {
    const exits = await db('exits').select()
    expect(exits).toHaveLength(24)
  })

  it('has exactly one locked exit', async () => {
    const lockedExits = await db('exits').where({ is_locked: true })
    expect(lockedExits).toHaveLength(1)
    expect(lockedExits[0].direction).toBe('south')
  })

  it('locked exit goes from leeds-cuba toward ghuznee-cuba', async () => {
    const [lockedExit] = await db('exits').where({ is_locked: true })
    const originNode = await db('locations').where({ id: lockedExit.from_location_id }).first()
    const destNode = await db('locations').where({ id: lockedExit.to_location_id }).first()
    expect(originNode.slug).toBe('leeds-cuba')
    expect(destNode.slug).toBe('ghuznee-cuba')
  })

  it('has 9 location tokens, one per location', async () => {
    const tokens = await db('location_tokens').select()
    expect(tokens).toHaveLength(9)
  })

  it('has a riddle on the locked exit', async () => {
    const [lockedExit] = await db('exits').where({ is_locked: true })
    const riddle = await db('riddles').where({ exit_id: lockedExit.id }).first()
    expect(riddle).toBeDefined()
    expect(riddle.answer).toBe('1996')
  })
})
