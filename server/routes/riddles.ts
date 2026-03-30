import express from 'express'
import { isAuthenticated } from '../middleware/isAuthenticated.ts'
import db from '../db/connection.ts'

const router = express.Router()

// POST /api/riddles/:exitId/attempt
router.post('/:exitId/attempt', isAuthenticated, async (req, res) => {
  const exitId = Number(req.params.exitId)
  const userId = req.session.userId as number
  const { answer } = req.body

  if (!answer) {
    res.status(400).json({ error: 'An answer is required' })
    return
  }

  const riddle = await db('riddles').where({ exit_id: exitId }).first()
  if (!riddle) {
    res.status(404).json({ error: 'No riddle found for this exit' })
    return
  }

  const correct = answer.trim().toLowerCase() === riddle.answer.trim().toLowerCase()

  if (correct) {
    await db('player_unlocked_exits').insert({ user_id: userId, exit_id: exitId })
    res.json({ correct: true })
    return
  }

  const failureMessage = riddle.failure_message.replace('{answer}', answer)
  res.json({ correct: false, message: failureMessage })
})

export default router
