import { Request, Response, NextFunction } from 'express'

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    next()
  } else {
    res.status(401).json({ error: 'You must be logged in to do that' })
  }
}
