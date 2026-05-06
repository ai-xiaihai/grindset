import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthScreen() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })

    if (error) {
      setError(error.message)
    } else if (mode === 'signup') {
      setSuccess('check your email to confirm your account.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">grindset</div>
        <div className="auth-tagline">optimize your lifestyle</div>

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">email</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <button className="btn auth-btn" type="submit" disabled={loading}>
            {loading ? 'loading...' : mode === 'login' ? 'log in' : 'sign up'}
          </button>
        </form>

        <button className="auth-toggle" onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setSuccess(null) }}>
          {mode === 'login' ? "don't have an account? sign up" : 'already have an account? log in'}
        </button>
      </div>
    </div>
  )
}
