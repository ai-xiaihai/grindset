const TABS = [
  {
    id: 'feed',
    label: 'feed',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="15" y2="12" />
        <line x1="3" y1="18" x2="18" y2="18" />
      </svg>
    ),
  },
  {
    id: 'leaderboard',
    label: 'leaderboard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="13" width="5" height="9" rx="1" />
        <rect x="9.5" y="7" width="5" height="15" rx="1" />
        <rect x="17" y="2" width="5" height="20" rx="1" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'profile',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav">
      <div className="nav-logo">grindset</div>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`nav-tab${active === t.id ? ' nav-tab--active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          <span className="nav-tab-icon">{t.icon}</span>
          <span className="nav-tab-label">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
