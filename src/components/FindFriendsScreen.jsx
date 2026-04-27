import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function FindFriendsScreen({ userId, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [followedIds, setFollowedIds] = useState(new Set())
  const debounceRef = useRef(null)

  useEffect(() => {
    supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)
      .then(({ data }) => {
        if (data) setFollowedIds(new Set(data.map(r => r.following_id)))
      })
  }, [userId])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const trimmed = query.trim()
    if (!trimmed) { setResults([]); return }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      const { data } = await supabase.rpc('search_users_by_email', { search_query: trimmed })
      setResults((data || []).filter(u => u.id !== userId))
      setLoading(false)
    }, 400)

    return () => clearTimeout(debounceRef.current)
  }, [query, userId])

  const toggleFollow = async (targetId) => {
    const isFollowing = followedIds.has(targetId)
    const next = new Set(followedIds)

    if (isFollowing) {
      next.delete(targetId)
      setFollowedIds(next)
      await supabase.from('follows').delete()
        .eq('follower_id', userId)
        .eq('following_id', targetId)
    } else {
      next.add(targetId)
      setFollowedIds(next)
      await supabase.from('follows').insert({ follower_id: userId, following_id: targetId })
    }
  }

  return (
    <div className="ff-overlay">
      <div className="ff-screen">
        <div className="ff-header">
          <button className="ff-back" onClick={onClose}>&larr;</button>
          <span className="ff-title">find friends</span>
        </div>

        <div className="ff-search-wrap">
          <input
            className="form-input ff-input"
            type="email"
            placeholder="search by email..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="ff-results">
          {loading && <div className="ff-status">searching...</div>}
          {!loading && query.trim() && results.length === 0 && (
            <div className="ff-status">no users found</div>
          )}
          {results.map(user => {
            const isFollowing = followedIds.has(user.id)
            return (
              <div key={user.id} className="ff-row">
                <div className="ff-row-left">
                  <div className="ff-avatar">{user.name[0]}</div>
                  <div className="ff-user-info">
                    <div className="ff-user-name">{user.name}</div>
                    <div className="ff-user-email">{user.email}</div>
                  </div>
                </div>
                <button
                  className={`ff-follow-btn${isFollowing ? ' ff-follow-btn--following' : ''}`}
                  onClick={() => toggleFollow(user.id)}
                >
                  {isFollowing ? 'following' : 'follow'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
