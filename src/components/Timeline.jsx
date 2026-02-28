function relativeTime(iso) {
  const diff = Date.now() - new Date(iso)
  if (diff < 60_000)   return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const LABELS = {
  vape: 'Vape Session',
  drink: 'Drink',
}

const ICONS = {
  vape: '💨',
  drink: '🥃',
}

export default function Timeline({ entries }) {
  if (entries.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Recent Activity</div>
        <div className="timeline-empty">
          <p>No entries yet.</p>
          <p className="timeline-empty-sub">Your journey begins with a single log.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-title">Recent Activity</div>
      <div className="timeline">
        {entries.map(entry => (
          <div key={entry.id} className={`timeline-item timeline-item--${entry.type}`}>
            <div className="timeline-icon">{ICONS[entry.type]}</div>
            <div className="timeline-content">
              <div className="timeline-label">
                {LABELS[entry.type]}
                {entry.note && <span className="timeline-note"> · {entry.note}</span>}
              </div>
              <div className="timeline-time">{relativeTime(entry.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
