import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function OnboardingScreen({ userId, onComplete }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handle = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('profiles')
      .insert({ id: userId, name: trimmed })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      onComplete({ id: userId, name: trimmed })
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">grindset</div>
        <div className="auth-tagline">what do your friends call you?</div>

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">your name</label>
            <input
              className="form-input"
              type="text"
              placeholder="enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
              maxLength={50}
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="btn auth-btn" type="submit" disabled={loading || !name.trim()}>
            {loading ? 'saving...' : "let's go"}
          </button>
        </form>
      </div>
    </div>
  )
}
