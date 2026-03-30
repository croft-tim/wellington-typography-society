import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import { useLogin } from '../hooks/useAuth.ts'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()
  const login = useLogin()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login.mutate(
      { email, password },
      { onSuccess: () => navigate('/game') },
    )
  }

  return (
    <div className="auth-page">
      <h1>Enter the Archive</h1>
      <form onSubmit={handleSubmit}>
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
        {login.error && (
          <p className="error">{(login.error as Error).message}</p>
        )}
        <button type="submit" disabled={login.isPending}>
          {login.isPending ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p>
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}

export default LoginPage
