import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import bcrypt from 'bcryptjs'
import app from '../server.ts'
import appDb from '../db/connection.ts'

// The auth routes use the app's own db connection (server/db/connection.ts).
// In NODE_ENV=test that resolves to an in-memory SQLite db, so we run
// migrations here to give it the correct schema before any requests are made.
beforeAll(async () => {
  await appDb.migrate.latest()
})

afterAll(async () => {
  await appDb.destroy()
})

describe('POST /api/auth/signup', () => {
  it('creates a new user and returns their details', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      username: 'oedipa',
      email: 'oedipa@tristero.nz',
      password: 'lot49secret',
    })

    expect(res.status).toBe(201)
    expect(res.body.username).toBe('oedipa')
    expect(res.body.email).toBe('oedipa@tristero.nz')
    expect(res.body.id).toBeTypeOf('number')
  })

  it('stores a bcrypt hash, not the plaintext password', async () => {
    await request(app).post('/api/auth/signup').send({
      username: 'mucho',
      email: 'mucho@tristero.nz',
      password: 'plaintext',
    })

    const user = await appDb('users').where({ email: 'mucho@tristero.nz' }).first()
    expect(user.password_hash).not.toBe('plaintext')
    expect(await bcrypt.compare('plaintext', user.password_hash)).toBe(true)
  })

  it('rejects signup with a duplicate email', async () => {
    await request(app).post('/api/auth/signup').send({
      username: 'first',
      email: 'duplicate@tristero.nz',
      password: 'password1',
    })

    const res = await request(app).post('/api/auth/signup').send({
      username: 'second',
      email: 'duplicate@tristero.nz',
      password: 'password2',
    })

    expect(res.status).toBe(409)
  })

  it('rejects signup with missing fields', async () => {
    const res = await request(app).post('/api/auth/signup').send({ email: 'no@password.nz' })
    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    const hash = await bcrypt.hash('correctpassword', 12)
    await appDb('users').insert({
      username: 'inverarity',
      email: 'inverarity@tristero.nz',
      password_hash: hash,
    })
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'inverarity@tristero.nz',
      password: 'correctpassword',
    })

    expect(res.status).toBe(200)
    expect(res.body.username).toBe('inverarity')
  })

  it('rejects login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'inverarity@tristero.nz',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
  })

  it('rejects login with unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@tristero.nz',
      password: 'whatever',
    })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  it('returns 200 and a message', async () => {
    const res = await request(app).post('/api/auth/logout')
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Logged out')
  })
})

describe('GET /api/auth/me', () => {
  it('returns 401 when not logged in', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns user details when logged in', async () => {
    const agent = request.agent(app)

    await agent.post('/api/auth/signup').send({
      username: 'driblette',
      email: 'driblette@tristero.nz',
      password: 'thetrystero',
    })

    const res = await agent.get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.username).toBe('driblette')
  })
})
