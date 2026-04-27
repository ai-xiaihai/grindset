import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function FollowList({ userId, currentUserId, mode, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [followedIds, setFollowedIds] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      let query
      if (mode === 'followers') {
        query = supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(id, name, email)')
          .eq('following_id', userId)
      } else {
        query = supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(id, name, email)')
          .eq('follower_id', userId)
      }

      const { data } = await query
      const list = (data || []).map(r =>
        mode === 'followers' ? r.profiles : r.profiles
      )
      setUsers(list)

      const { data: myFollows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
      if (myFollows) setFollowedIds(new Set(myFollows.map(r => r.following_id)))

      setLoading(false)
    }
    load()
  }, [userId, currentUserId, mode])

  const toggleFollow = async (targetId) => {
    const isFollowing = followedIds.has(targetId)
    const next = new Set(followedIds)

    if (isFollowing) {
      next.delete(targetId)
      setFollowedIds(next)
      await supabase.from('follows').delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetId)
    } else {
      next.add(targetId)
      setFollowedIds(next)
      await supabase.from('follows').insert({ follower_id: currentUserId, following_id: targetId })
    }
  }

  return (
    <div className="ff-overlay">
      <div className="ff-screen">
        <div className="ff-header">
          <button className="ff-back" onClick={onClose}>&larr;</button>
          <span className="ff-title">{mode}</span>
        </div>

        <div className="ff-results">
          {loading && <div className="ff-status">loading...</div>}
          {!loading && users.length === 0 && (
            <div className="ff-status">no {mode} yet</div>
          )}
          {users.map(user => {
            const isMe = user.id === currentUserId
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
                {!isMe && (
                  <button
                    className={`ff-follow-btn${isFollowing ? ' ff-follow-btn--following' : ''}`}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {isFollowing ? 'following' : 'follow'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
