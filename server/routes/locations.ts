import express from 'express'
import { isAuthenticated } from '../middleware/isAuthenticated.ts'
import { getLocationBySlug, hasVisitedLocation } from '../db/locations.ts'
import db from '../db/connection.ts'

const router = express.Router()

// GET /api/locations/:slug
router.get('/:slug', isAuthenticated, async (req, res) => {
  const { slug } = req.params
  const userId = req.session.userId as number

  const location = await getLocationBySlug(slug)
  if (!location) {
    res.status(404).json({ error: 'Location not found' })
    return
  }

  const visited = await hasVisitedLocation(userId, location.id)
  if (!visited) {
    res.status(403).json({ error: 'You have not been to this location yet' })
    return
  }

  // Fetch all exits from this location, with riddle and player-unlock status
  const exits = await db('exits')
    .where('exits.from_location_id', location.id)
    .leftJoin('riddles', 'exits.id', 'riddles.exit_id')
    .leftJoin('player_unlocked_exits', function () {
      this.on('exits.id', '=', 'player_unlocked_exits.exit_id').andOn(
        'player_unlocked_exits.user_id',
        '=',
        db.raw('?', [userId]),
      )
    })
    .leftJoin('locations as dest', 'exits.to_location_id', 'dest.id')
    .select(
      'exits.id',
      'exits.direction',
      'exits.is_locked',
      'exits.to_location_id',
      'dest.slug as to_slug',
      'riddles.id as riddle_id',
      'riddles.question as riddle_question',
      'riddles.hint as riddle_hint',
      'player_unlocked_exits.id as unlocked_by_player',
    )

  // For each exit, check if the player has visited the destination
  const exitsWithVisitStatus = await Promise.all(
    exits.map(async (exit) => {
      const destinationVisited = await hasVisitedLocation(userId, exit.to_location_id)
      return {
        id: exit.id,
        direction: exit.direction,
        toSlug: exit.to_slug,
        isLocked: Boolean(exit.is_locked) && !exit.unlocked_by_player,
        riddleId: exit.riddle_id ?? null,
        riddleQuestion: exit.is_locked && !exit.unlocked_by_player ? exit.riddle_question : null,
        riddleHint: exit.is_locked && !exit.unlocked_by_player ? exit.riddle_hint : null,
        destinationVisited,
      }
    }),
  )

  res.json({
    id: location.id,
    slug: location.slug,
    name: location.name,
    description: location.description,
    exits: exitsWithVisitStatus,
  })
})

export default router
