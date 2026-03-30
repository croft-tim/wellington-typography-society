import request from 'superagent'

export interface Exit {
  id: number
  direction: 'north' | 'south' | 'east' | 'west'
  toSlug: string
  isLocked: boolean
  riddleId: number | null
  riddleQuestion: string | null
  riddleHint: string | null
  destinationVisited: boolean
}

export interface LocationData {
  id: number
  slug: string
  name: string
  description: string
  exits: Exit[]
}

export async function getLocation(slug: string): Promise<LocationData> {
  const res = await request.get(`/api/locations/${slug}`)
  return res.body
}
