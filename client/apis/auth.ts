import request from 'superagent'

export interface AuthUser {
  id: number
  username: string
  email: string
}

export async function signup(username: string, email: string, password: string) {
  const res = await request.post('/api/auth/signup').send({ username, email, password })
  return res.body as AuthUser
}

export async function login(email: string, password: string) {
  const res = await request.post('/api/auth/login').send({ email, password })
  return res.body as AuthUser
}

export async function logout() {
  await request.post('/api/auth/logout')
}

export async function getMe() {
  const res = await request.get('/api/auth/me')
  return res.body as AuthUser
}
