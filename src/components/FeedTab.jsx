import BACGraph from './BACGraph'
import Insights from './Insights'

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso)
  if (diff < 60_000) return 'just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const ENTRY_META = {
  vape:  { icon: '💨', label: 'Vape Session',  color: 'teal' },
  drink: { icon: '🥃', label: 'Drink',          color: 'amber' },
  bac:   { icon: '🩸', label: 'BAC Reading',    color: 'red' },
}

function FeedEntry({ entry }) {
  const meta = ENTRY_META[entry.type] || ENTRY_META.vape
  return (
    <div className={`feed-entry feed-entry--${meta.color}`}>
      <div className="feed-entry-icon">{meta.icon}</div>
      <div className="feed-entry-body">
        <div className="feed-entry-label">
          {meta.label}
          {entry.bac !== undefined && <span className="feed-entry-bac"> {entry.bac.toFixed(3)} g/dL</span>}
          {entry.note && <span className="feed-entry-note"> · {entry.note}</span>}
        </div>
        <div className="feed-entry-time">{relativeTime(entry.timestamp)}</div>
      </div>
      {entry.photo && <img src={entry.photo} alt="" className="feed-entry-photo" />}
    </div>
  )
}

export default function FeedTab({ entries, bacEntries, stats }) {
  const today = new Date().toDateString()
  const todayBac = bacEntries.filter(e => new Date(e.timestamp).toDateString() === today)

  // Merge and sort all entries chronologically
  const allFeed = [
    ...entries.map(e => ({ ...e })),
    ...bacEntries.map(e => ({ ...e, type: 'bac' })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const hasTodayActivity = stats.todayVapes > 0 || stats.todayDrinks > 0 || todayBac.length > 0

  return (
    <div className="tab-screen">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-logo">GRINDSET</div>
        <div className="page-header-date">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="tab-body">
        {/* Today summary */}
        {hasTodayActivity ? (
          <div className="today-summary">
            <div className="today-summary-label">Today</div>
            <div className="today-pills">
              {stats.todayVapes > 0 && (
                <span className="today-pill today-pill--teal">💨 {stats.todayVapes} vape{stats.todayVapes !== 1 ? 's' : ''}</span>
              )}
              {stats.todayDrinks > 0 && (
                <span className="today-pill today-pill--amber">🥃 {stats.todayDrinks} drink{stats.todayDrinks !== 1 ? 's' : ''}</span>
              )}
              {todayBac.length > 0 && (
                <span className="today-pill today-pill--red">🩸 BAC {todayBac[0].bac.toFixed(3)}</span>
              )}
              <span className="today-pill today-pill--slate">✦ {stats.wellnessScore}/100</span>
            </div>
          </div>
        ) : (
          <div className="today-empty">
            <p>Nothing logged yet today.</p>
            <p>Your potential remains untapped.</p>
          </div>
        )}

        {/* BAC graph if readings today */}
        {todayBac.length > 0 && (
          <div className="feed-section">
            <BACGraph entries={bacEntries} />
          </div>
        )}

        {/* Insights */}
        <div className="feed-section">
          <Insights />
        </div>

        {/* Activity feed */}
        <div className="feed-section">
          <div className="section-title">Activity</div>
          {allFeed.length === 0 ? (
            <div className="feed-empty">
              <p>No activity yet.</p>
              <p>Head to Record to start your journey.</p>
            </div>
          ) : (
            <div className="feed-list">
              {allFeed.slice(0, 40).map(entry => (
                <FeedEntry key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
