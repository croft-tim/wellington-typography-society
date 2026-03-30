import db from './connection.ts'

export function getLocationByToken(token: string) {
  return db('location_tokens')
    .join('locations', 'location_tokens.location_id', 'locations.id')
    .where('location_tokens.token', token)
    .select('locations.*', 'location_tokens.token')
    .first()
}

export function getLocationBySlug(slug: string) {
  return db('locations').where({ slug }).first()
}

export function hasVisitedLocation(userId: number, locationId: number) {
  return db('player_visited_locations')
    .where({ user_id: userId, location_id: locationId })
    .first()
    .then(Boolean)
}

export function recordVisit(userId: number, locationId: number, token: string) {
  return db('player_visited_locations').insert({
    user_id: userId,
    location_id: locationId,
    token_used: token,
  })
}

export function upsertProgress(userId: number, locationId: number) {
  return db('player_progress')
    .where({ user_id: userId })
    .first()
    .then((existing) => {
      if (existing) {
        return db('player_progress')
          .where({ user_id: userId })
          .update({ current_location_id: locationId, updated_at: db.fn.now() })
      }
      return db('player_progress').insert({
        user_id: userId,
        current_location_id: locationId,
      })
    })
}
