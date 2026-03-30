import knex from 'knex'
import { resolve } from 'node:path'

// Standalone in-memory test database — does not share the app's connection or knexfile
export const db = knex({
  client: 'sqlite3',
  useNullAsDefault: true,
  connection: { filename: ':memory:' },
  migrations: {
    directory: resolve('server/db/migrations'),
  },
  pool: {
    afterCreate: (conn: any, cb: any) => conn.run('PRAGMA foreign_keys = ON', cb),
  },
})

export async function setupTestDb() {
  await db.migrate.latest()
  await insertTestData()
}

export async function teardownTestDb() {
  await db.destroy()
}

async function insertTestData() {
  await db('locations').insert([
    { id: 1, slug: 'dixon-taranaki',   name: 'Dixon & Taranaki',   description: 'Test node', grid_x: 0, grid_y: 0 },
    { id: 2, slug: 'dixon-tory',       name: 'Dixon & Tory',       description: 'Test node', grid_x: 1, grid_y: 0 },
    { id: 3, slug: 'dixon-cuba',       name: 'Dixon & Cuba',       description: 'Test node', grid_x: 2, grid_y: 0 },
    { id: 4, slug: 'leeds-taranaki',   name: 'Leeds & Taranaki',   description: 'Test node', grid_x: 0, grid_y: 1 },
    { id: 5, slug: 'leeds-tory',       name: 'Leeds & Tory',       description: 'Test node', grid_x: 1, grid_y: 1 },
    { id: 6, slug: 'leeds-cuba',       name: 'Leeds & Cuba',       description: 'Test node', grid_x: 2, grid_y: 1 },
    { id: 7, slug: 'ghuznee-taranaki', name: 'Ghuznee & Taranaki', description: 'Test node', grid_x: 0, grid_y: 2 },
    { id: 8, slug: 'ghuznee-tory',     name: 'Ghuznee & Tory',     description: 'Test node', grid_x: 1, grid_y: 2 },
    { id: 9, slug: 'ghuznee-cuba',     name: 'Ghuznee & Cuba',     description: 'Test node', grid_x: 2, grid_y: 2 },
  ])

  await db('location_tokens').insert([
    { id: 1, location_id: 1, token: 'test-token-0000-0000-0000-000000000001' },
    { id: 2, location_id: 2, token: 'test-token-0000-0000-0000-000000000002' },
    { id: 3, location_id: 3, token: 'test-token-0000-0000-0000-000000000003' },
    { id: 4, location_id: 4, token: 'test-token-0000-0000-0000-000000000004' },
    { id: 5, location_id: 5, token: 'test-token-0000-0000-0000-000000000005' },
    { id: 6, location_id: 6, token: 'test-token-0000-0000-0000-000000000006' },
    { id: 7, location_id: 7, token: 'test-token-0000-0000-0000-000000000007' },
    { id: 8, location_id: 8, token: 'test-token-0000-0000-0000-000000000008' },
    { id: 9, location_id: 9, token: 'test-token-0000-0000-0000-000000000009' },
  ])

  await db('exits').insert([
    // Dixon row — east/west
    { id: 1,  from_location_id: 1, to_location_id: 2, direction: 'east',  is_locked: false },
    { id: 2,  from_location_id: 2, to_location_id: 1, direction: 'west',  is_locked: false },
    { id: 3,  from_location_id: 2, to_location_id: 3, direction: 'east',  is_locked: false },
    { id: 4,  from_location_id: 3, to_location_id: 2, direction: 'west',  is_locked: false },
    // Leeds row — east/west
    { id: 5,  from_location_id: 4, to_location_id: 5, direction: 'east',  is_locked: false },
    { id: 6,  from_location_id: 5, to_location_id: 4, direction: 'west',  is_locked: false },
    { id: 7,  from_location_id: 5, to_location_id: 6, direction: 'east',  is_locked: false },
    { id: 8,  from_location_id: 6, to_location_id: 5, direction: 'west',  is_locked: false },
    // Ghuznee row — east/west
    { id: 9,  from_location_id: 7, to_location_id: 8, direction: 'east',  is_locked: false },
    { id: 10, from_location_id: 8, to_location_id: 7, direction: 'west',  is_locked: false },
    { id: 11, from_location_id: 8, to_location_id: 9, direction: 'east',  is_locked: false },
    { id: 12, from_location_id: 9, to_location_id: 8, direction: 'west',  is_locked: false },
    // Taranaki column — north/south
    { id: 13, from_location_id: 1, to_location_id: 4, direction: 'south', is_locked: false },
    { id: 14, from_location_id: 4, to_location_id: 1, direction: 'north', is_locked: false },
    { id: 15, from_location_id: 4, to_location_id: 7, direction: 'south', is_locked: false },
    { id: 16, from_location_id: 7, to_location_id: 4, direction: 'north', is_locked: false },
    // Tory column — north/south
    { id: 17, from_location_id: 2, to_location_id: 5, direction: 'south', is_locked: false },
    { id: 18, from_location_id: 5, to_location_id: 2, direction: 'north', is_locked: false },
    { id: 19, from_location_id: 5, to_location_id: 8, direction: 'south', is_locked: false },
    { id: 20, from_location_id: 8, to_location_id: 5, direction: 'north', is_locked: false },
    // Cuba column — north/south (exit 23 is locked)
    { id: 21, from_location_id: 3, to_location_id: 6, direction: 'south', is_locked: false },
    { id: 22, from_location_id: 6, to_location_id: 3, direction: 'north', is_locked: false },
    { id: 23, from_location_id: 6, to_location_id: 9, direction: 'south', is_locked: true  },
    { id: 24, from_location_id: 9, to_location_id: 6, direction: 'north', is_locked: false },
  ])

  await db('riddles').insert([
    {
      id: 1,
      exit_id: 23,
      question: 'Test riddle question',
      answer: '1996',
      hint: 'Test hint',
      failure_message: 'Wrong answer: {answer}',
    },
  ])
}
