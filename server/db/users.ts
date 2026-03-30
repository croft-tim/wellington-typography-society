import db from './connection.ts'

export interface UserRow {
  id: number
  username: string
  email: string
  password_hash: string
  created_at: string
}

export function getUserByEmail(email: string) {
  return db('users').where({ email }).first() as Promise<UserRow | undefined>
}

export function getUserByUsername(username: string) {
  return db('users').where({ username }).first() as Promise<UserRow | undefined>
}

export function getUserById(id: number) {
  return db('users').where({ id }).first() as Promise<UserRow | undefined>
}

export function createUser(username: string, email: string, passwordHash: string) {
  return db('users')
    .insert({ username, email, password_hash: passwordHash })
    .then(([id]) => id as number)
}
