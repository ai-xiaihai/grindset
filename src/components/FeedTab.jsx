import { useState } from 'react'
import eastVillageMap from '../assets/maps/east-village.png'
import FRIENDS from '../data/friends.json'

// ── Mock friend posts (derived from friends.json) ─
const MOCK_POSTS = FRIENDS
  .filter(f => f.post)
  .map(f => ({ id: f.id, name: f.name.toLowerCase(), color: f.color, ...f.post }))

// ── Static map image ─────────────────────────────
function RouteMap({ color }) {
  return (
    <div className="feed-map feed-map--route" style={{ position: 'relative' }}>
      <img src={eastVillageMap} alt="East Village map" style={{ width: '100%', height: 190, objectFit: 'cover', display: 'block' }} />
      <svg viewBox="0 0 320 190" width="100%" height="190" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Astor Pl → E 8th east to 3rd Ave → north to E 11th → east to 2nd Ave → south to E 5th → west back to Lafayette */}
        <path
          d="M 33 95 L 117 150 L 170 70 L 223 100 L 202 137 L 185 146"
          fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M 33 95 L 117 150 L 170 70 L 223 100 L 202 137 L 185 146"
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
        />
        <circle cx="33" cy="95" r="7" fill="#58CC02" stroke="#fff" strokeWidth="2.5" />
        <circle cx="33" cy="95" r="2.5" fill="#fff" />
        <path d="M 193 146 C 193 138 185 132 185 132 C 185 132 177 138 177 146 C 177 153 185 154 185 154 C 185 154 193 153 193 146 Z" fill={color} stroke="#fff" strokeWidth="2" />
        <circle cx="185" cy="146" r="3" fill="#fff" />
      </svg>
    </div>
  )
}

// ── Single feed card ──────────────────────────────
function NightOutCard({ post, isMe }) {
  const [daps, setDaps] = useState(post.daps)
  const [daped, setDaped] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState([])

  const handleDap = () => {
    if (daped) return
    setDaps(d => d + 1)
    setDaped(true)
  }

  const handleSend = () => {
    if (!comment.trim()) return
    setComments(c => [...c, comment.trim()])
    setComment('')
    setCommenting(false)
  }

  return (
    <div className="feed-card" style={{ '--card-color': post.color }}>
      <div className="feed-card-accent" />

      {/* Header */}
      <div className="feed-card-header">
        <div className="feed-card-avatar" style={{ background: post.color }}>
          {post.name[0].toUpperCase()}
        </div>
        <div>
          <div className="feed-card-name">{post.name}</div>
          <div className="feed-card-date">{post.date}</div>
        </div>
      </div>

      {/* Map if present */}
      {post.route && <RouteMap color={post.color} />}

      {/* Stats */}
      <div className="feed-card-stats">
        {post.duration && (
          <div className="feed-stat">
            <div className="feed-stat-label">duration</div>
            <div className="feed-stat-val">{post.duration}</div>
          </div>
        )}
        {post.maxBac && (
          <div className="feed-stat">
            <div className="feed-stat-label">{post.bacLabel ?? 'max bac'}</div>
            <div className="feed-stat-val">{post.maxBac}</div>
          </div>
        )}
        {post.cigs != null && (
          <div className="feed-stat">
            <div className="feed-stat-label"># of cigs</div>
            <div className="feed-stat-val">{post.cigs}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="feed-card-actions">
        <button
          className={`feed-dap-btn${daped ? ' feed-dap-btn--done' : ''}`}
          style={daped ? { background: post.color, boxShadow: `0 4px 0 ${post.color}aa` } : {}}
          onClick={handleDap}
        >
          {daped ? `👊 ${daps}` : `👊 dap up${daps > 0 ? ` · ${daps}` : ''}`}
        </button>
        <button className="feed-comment-btn" onClick={() => setCommenting(v => !v)}>
          💬 comment
        </button>
      </div>

      {comments.length > 0 && (
        <div className="feed-comments-list">
          {comments.map((c, i) => (
            <div key={i} className="feed-comment-item">
              <span className="feed-comment-you">you</span> {c}
            </div>
          ))}
        </div>
      )}

      {commenting && (
        <div className="feed-comment-box">
          <button className="feed-comment-dismiss" onClick={() => { setComment(''); setCommenting(false) }}>
            ✕
          </button>
          <input
            className="feed-comment-input"
            placeholder="say something..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            autoFocus
          />
          <button
            className="feed-comment-send"
            style={{ background: post.color }}
            onClick={handleSend}
          >
            send
          </button>
        </div>
      )}
    </div>
  )
}

// ── Main FeedTab ──────────────────────────────────
export default function FeedTab({ entries, bacEntries, stats }) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toLowerCase()

  // build a "your post" card if there's recent activity
  const hasActivity = stats.totalVapes > 0 || stats.totalDrinks > 0 || stats.totalBac > 0
  const myPost = hasActivity ? {
    id: 'me',
    name: 'alex',
    date: dateStr,
    duration: null,
    maxBac: bacEntries.length > 0 ? `${Math.max(...bacEntries.map(e => e.bac)).toFixed(2)}%` : '0.08%',
    bacLabel: 'bac',
    cigs: null,
    path: null,
    color: '#58CC02',
    daps: 3,
  } : null

  const allPosts = myPost ? [MOCK_POSTS[0], myPost, ...MOCK_POSTS.slice(1)] : MOCK_POSTS

  return (
    <div className="feed-screen">
      {/* Header */}
      <div className="feed-header">
        <span className="feed-header-logo">GRINDSET</span>
        <span className="feed-header-date">
          {today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="feed-body">
        {allPosts.map(post => (
          <NightOutCard key={post.id} post={post} isMe={post.id === 'me'} />
        ))}
      </div>
    </div>
  )
}
