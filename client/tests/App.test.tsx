import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'

afterEach(cleanup)
import App from '../components/App.tsx'

vi.mock('../hooks/useFruits.ts', () => ({
  useFruits: () => ({ data: ['banana', 'apple', 'feijoa'] }),
}))

describe('App', () => {
  it('renders the heading', () => {
    render(<App />)
    expect(screen.getByText('Fullstack Boilerplate - with Fruits!')).toBeTruthy()
  })

  it('renders fruit list items', () => {
    render(<App />)
    expect(screen.getByText('banana')).toBeTruthy()
    expect(screen.getByText('apple')).toBeTruthy()
    expect(screen.getByText('feijoa')).toBeTruthy()
  })
})
