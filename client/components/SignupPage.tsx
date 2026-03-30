import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useSignup } from '../hooks/useAuth.ts'

function SignupPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const signup = useSignup()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    signup.mutate(
      { username, email, password },
      { onSuccess: () => navigate('/game') },
    )
  }

  return (
    <div className="auth-page">
      <h1>Join the Society</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {signup.error && (
          <p className="error">{(signup.error as Error).message}</p>
        )}
        <button type="submit" disabled={signup.isPending}>
          {signup.isPending ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}

export default SignupPage
