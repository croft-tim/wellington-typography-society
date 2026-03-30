import express from 'express'
import bcrypt from 'bcryptjs'
import {
  getUserByEmail,
  getUserByUsername,
  getUserById,
  createUser,
} from '../db/users.ts'

const router = express.Router()

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    res.status(400).json({ error: 'Username, email, and password are required' })
    return
  }

  const existingEmail = await getUserByEmail(email)
  if (existingEmail) {
    res.status(409).json({ error: 'An account with that email already exists' })
    return
  }

  const existingUsername = await getUserByUsername(username)
  if (existingUsername) {
    res.status(409).json({ error: 'That username is already taken' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const userId = await createUser(username, email, passwordHash)

  req.session.userId = userId
  res.status(201).json({ id: userId, username, email })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' })
    return
  }

  const user = await getUserByEmail(email)
  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatch) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  req.session.userId = user.id
  res.json({ id: user.id, username: user.username, email: user.email })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' })
  })
})

// GET /api/auth/me
router.get('/me', async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: 'Not logged in' })
    return
  }

  const user = await getUserById(req.session.userId)
  if (!user) {
    res.status(401).json({ error: 'Not logged in' })
    return
  }

  res.json({ id: user.id, username: user.username, email: user.email })
})

export default router
