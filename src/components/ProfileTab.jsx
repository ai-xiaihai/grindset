import Achievements from './Achievements'

const LEVELS = [
  { min: 0,    max: 99,   num: 1, label: 'Curious Newcomer',      color: '#94a3b8' },
  { min: 100,  max: 299,  num: 2, label: 'Social Participator',   color: '#059669' },
  { min: 300,  max: 749,  num: 3, label: 'Dedicated Enthusiast',  color: '#0891b2' },
  { min: 750,  max: 1499, num: 4, label: 'Seasoned Professional', color: '#d97706' },
  { min: 1500, max: 2999, num: 5, label: 'Certified Legend',      color: '#dc2626' },
  { min: 3000, max: Infinity, num: 6, label: 'Transcendent Being', color: '#7c3aed' },
]

function getLevel(xp) {
  return LEVELS.slice().reverse().find(l => xp >= l.min) || LEVELS[0]
}

function XPBar({ xp }) {
  const level = getLevel(xp)
  const next = LEVELS[level.num] // next level object (index = level.num since 0-indexed)
  const progress = next
    ? ((xp - level.min) / (next.min - level.min)) * 100
    : 100

  return (
    <div className="xp-section">
      <div className="xp-level-row">
        <span className="xp-level-badge" style={{ background: level.color }}>Lv {level.num}</span>
        <div>
          <div className="xp-level-name">{level.label}</div>
          {next && <div className="xp-level-next">Next: {LEVELS[level.num].label}</div>}
        </div>
        <div className="xp-total">{xp.toLocaleString()} <span>XP</span></div>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%`, background: level.color }}
        />
      </div>
      {next && (
        <div className="xp-bar-labels">
          <span>{xp.toLocaleString()}</span>
          <span>{next.min.toLocaleString()} XP</span>
        </div>
      )}
    </div>
  )
}

export default function ProfileTab({ stats, entries, bacEntries }) {
  const { todayVapes, todayDrinks, totalVapes, totalDrinks, wellnessScore, streak, xp, totalBac } = stats

  return (
    <div className="tab-screen">
      <div className="page-header">
        <div className="page-header-title">Profile</div>
      </div>

      <div className="tab-body">
        {/* Avatar + XP */}
        <div className="profile-hero">
          <div className="profile-avatar">
            <span>GS</span>
          </div>
          <XPBar xp={xp} />
        </div>

        {/* Streak */}
        <div className="streak-card">
          <div className="streak-flame">🔥</div>
          <div className="streak-body">
            <div className="streak-count">{streak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
          <div className="streak-subtext">
            {streak === 0
              ? 'Start logging today to begin your streak.'
              : streak >= 7
              ? 'Unstoppable. Truly an inspiration.'
              : 'Keep it going. You\'re building something.'}
          </div>
        </div>

        {/* Today stats */}
        <div className="profile-section-title">Today</div>
        <div className="profile-stats-grid">
          <div className="profile-stat">
            <div className="profile-stat-icon">💨</div>
            <div className="profile-stat-val">{todayVapes}</div>
            <div className="profile-stat-label">Vapes</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-icon">🥃</div>
            <div className="profile-stat-val">{todayDrinks}</div>
            <div className="profile-stat-label">Drinks</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-icon">✦</div>
            <div className="profile-stat-val">{wellnessScore}</div>
            <div className="profile-stat-label">Wellness™</div>
          </div>
        </div>

        {/* All-time stats */}
        <div className="profile-section-title">All Time</div>
        <div className="profile-stats-grid">
          <div className="profile-stat">
            <div className="profile-stat-icon">💨</div>
            <div className="profile-stat-val">{totalVapes.toLocaleString()}</div>
            <div className="profile-stat-label">Vapes</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-icon">🥃</div>
            <div className="profile-stat-val">{totalDrinks.toLocaleString()}</div>
            <div className="profile-stat-label">Drinks</div>
          </div>
          <div className="profile-stat">
            <div className="profile-stat-icon">🩸</div>
            <div className="profile-stat-val">{totalBac}</div>
            <div className="profile-stat-label">BAC Scans</div>
          </div>
        </div>

        {/* XP breakdown */}
        <div className="xp-breakdown">
          <div className="profile-section-title">XP Breakdown</div>
          <div className="xp-breakdown-rows">
            <div className="xp-row"><span>💨 Vapes × 10</span><span>{(totalVapes * 10).toLocaleString()}</span></div>
            <div className="xp-row"><span>🥃 Drinks × 15</span><span>{(totalDrinks * 15).toLocaleString()}</span></div>
            <div className="xp-row"><span>🩸 BAC Scans × 25</span><span>{(totalBac * 25).toLocaleString()}</span></div>
            <div className="xp-row"><span>🔥 Streak × 50</span><span>{(streak * 50).toLocaleString()}</span></div>
            <div className="xp-row xp-row--total"><span>Total</span><span>{xp.toLocaleString()} XP</span></div>
          </div>
        </div>

        {/* Achievements */}
        <div className="profile-section-title">Achievements</div>
        <Achievements
          todayVapes={todayVapes}
          todayDrinks={todayDrinks}
          streak={streak}
          totalVapes={totalVapes}
          totalDrinks={totalDrinks}
        />
      </div>
    </div>
  )
}
