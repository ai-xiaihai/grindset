import { useState } from 'react'

const FRIENDS = [
  { name: 'Dmitri',  emoji: '☁️' },
  { name: 'Priya',   emoji: '🍺' },
  { name: 'Marcus',  emoji: '⚔️' },
  { name: 'Yuki',    emoji: '🌅' },
  { name: 'Fatima',  emoji: '🔥' },
  { name: 'Carlos',  emoji: '🦋' },
  { name: 'Siobhan', emoji: '🦉' },
  { name: 'Kwame',   emoji: '💻' },
  { name: 'Ingrid',  emoji: '🕔' },
  { name: 'Tariq',   emoji: '🤫' },
]

const AMOUNTS = [5, 10, 20]

export function shouldShowNudge() {
  return Math.random() < 0.15
}

export function randomFriend() {
  return FRIENDS[Math.floor(Math.random() * FRIENDS.length)]
}

export default function NudgeModal({ friend, onDismiss }) {
  const [selected, setSelected] = useState(10)

  const venmoHandle = friend.name

  const handleVenmo = () => {
    window.open(
      `https://venmo.com/${venmoHandle}?txn=pay&amount=${selected}&note=get+drinking+again`,
      '_blank'
    )
    onDismiss()
  }

  return (
    <div className="nudge-overlay" onClick={onDismiss}>
      <div className="nudge-sheet" onClick={e => e.stopPropagation()}>
        <button className="nudge-close" onClick={onDismiss}>✕</button>

        <div className="nudge-avatar">{friend.emoji}</div>
        <h2 className="nudge-title">Nudge {friend.name}</h2>
        <p className="nudge-subtitle">to get drinking again 🍻</p>

        <div className="nudge-amounts">
          {AMOUNTS.map(amt => (
            <button
              key={amt}
              className={`nudge-amt-btn${selected === amt ? ' nudge-amt-btn--active' : ''}`}
              onClick={() => setSelected(amt)}
            >
              ${amt}
            </button>
          ))}
        </div>

        <button className="nudge-venmo-btn" onClick={handleVenmo}>
          Venmo {friend.name} ${selected}
        </button>

        <button className="nudge-dismiss-btn" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  )
}
