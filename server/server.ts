import express from 'express'
import * as Path from 'node:path'
import session from 'express-session'

import fruitRoutes from './routes/fruits.ts'
import authRoutes from './routes/auth.ts'
import scanRoutes from './routes/scan.ts'
import locationRoutes from './routes/locations.ts'
import riddleRoutes from './routes/riddles.ts'

const server = express()

server.use(express.json())

server.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
)

server.use('/api/v1/fruits', fruitRoutes)
server.use('/api/auth', authRoutes)
server.use('/api/scan', scanRoutes)
server.use('/api/locations', locationRoutes)
server.use('/api/riddles', riddleRoutes)

if (process.env.NODE_ENV === 'production') {
  server.use(express.static(Path.resolve('public')))
  server.use('/assets', express.static(Path.resolve('./dist/assets')))
  server.get('*', (req, res) => {
    res.sendFile(Path.resolve('./dist/index.html'))
  })
}

export default server
