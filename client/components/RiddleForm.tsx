import { useState, FormEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attemptRiddle } from '../apis/riddles.ts'
import { Exit } from '../apis/locations.ts'

interface Props {
  exit: Exit
  locationSlug: string
}

function RiddleForm({ exit, locationSlug }: Props) {
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const attempt = useMutation({
    mutationFn: () => attemptRiddle(exit.riddleId as number, answer),
    onSuccess: (result) => {
      if (result.correct) {
        // Invalidate so the location re-fetches with the exit now unlocked
        queryClient.invalidateQueries({ queryKey: ['location', locationSlug] })
      } else {
        setFeedback(result.message ?? 'That is not correct.')
        setAnswer('')
      }
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFeedback(null)
    attempt.mutate()
  }

  return (
    <div className="riddle">
      <p className="riddle__question">{exit.riddleQuestion}</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          required
        />
        <button type="submit" disabled={attempt.isPending}>
          {attempt.isPending ? '...' : 'Try'}
        </button>
      </form>
      {feedback && <p className="riddle__feedback">{feedback}</p>}
      {exit.riddleHint && (
        <details className="riddle__hint">
          <summary>Hint</summary>
          <p>{exit.riddleHint}</p>
        </details>
      )}
    </div>
  )
}

export default RiddleForm
