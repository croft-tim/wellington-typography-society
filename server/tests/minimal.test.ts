import { describe, it, expect } from 'vitest'
import { db } from './helpers.ts'

describe('vitest setup', () => {
  it('runs in node environment', () => {
    expect(typeof process).toBe('object')
  })

  it('can import db', () => {
    expect(db).toBeDefined()
  })
})
