import express from 'express'
import { isAuthenticated } from '../middleware/isAuthenticated.ts'
import {
  getLocationByToken,
  hasVisitedLocation,
  recordVisit,
  upsertProgress,
} from '../db/locations.ts'

const router = express.Router()

// POST /api/scan/:token
router.post('/:token', isAuthenticated, async (req, res) => {
  const { token } = req.params
  const userId = req.session.userId as number

  const location = await getLocationByToken(token)
  if (!location) {
    res.status(404).json({ error: 'Unknown token — are you in the right place?' })
    return
  }

  const alreadyVisited = await hasVisitedLocation(userId, location.id)
  if (!alreadyVisited) {
    await recordVisit(userId, location.id, token)
  }

  await upsertProgress(userId, location.id)

  res.json({ slug: location.slug })
})

export default router
