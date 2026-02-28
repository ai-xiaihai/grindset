import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import firstInhaleImg from '../assets/badges/first-inhale.png'
import twoFistedImg from '../assets/badges/two-fisted.png'

// ── Duolingo palette ──────────────────────────────
const DUO = {
  green:  '#58CC02',
  greenDark: '#46A302',
  blue:   '#1CB0F6',
  blueDark: '#0A91CC',
  yellow: '#FFD900',
  purple: '#CE82FF',
  red:    '#FF4B4B',
  orange: '#FF9600',
}

// ── Friends with fake streak weeks ───────────────
const FRIENDS = [
  { name: 'Dmitri',  weeks: 9, emoji: '☁️' },
  { name: 'Priya',   weeks: 4,  emoji: '🍺' },
]

// added to real user stats so the profile looks well-used
const DEMO_BOOST = { xp: 6800, weeks: 13 }

// ── Badges (adapted from Achievements) ───────────
const BADGES = [
  { id: 'first-vape',   icon: '💨', name: 'First Inhale',     desc: 'Log your very first vape session.',          color: DUO.blue,   img: firstInhaleImg, check: s => s.totalVapes >= 1 },
  { id: 'two-fisted',   icon: '⚔️', name: 'double parked',    desc: 'Log a vape and a drink on the same day.',    color: DUO.red,    img: twoFistedImg,   check: s => s.todayVapes > 0 && s.todayDrinks > 0 },
  { id: 'cloud-chaser', icon: '☁️', name: 'Cloud Chaser',     desc: 'Log 10 vape sessions in a single day.',      color: DUO.blue,   check: s => s.todayVapes >= 10 },
  { id: 'open-bar',     icon: '🍸', name: 'Open Bar',          desc: 'Log 5 drinks in a single day.',              color: DUO.purple, check: s => s.todayDrinks >= 5 },
  { id: 'consistency',  icon: '👑', name: 'Consistency King',  desc: 'Maintain a 3-day streak.',                   color: DUO.yellow, check: s => s.streak >= 3 },
  { id: 'devoted',      icon: '🏆', name: 'Devoted',           desc: 'Maintain a 7-day streak.',                   color: DUO.orange, check: s => s.streak >= 7 },
  { id: 'quantified',   icon: '📱', name: 'Quantified Self',   desc: 'Log 5+ vapes and 5+ drinks total.',          color: DUO.green,  check: s => s.totalVapes >= 5 && s.totalDrinks >= 5 },
  { id: 'centurion',    icon: '💯', name: 'Centurion',         desc: 'Log 100 total vape sessions.',               color: DUO.red,    check: s => s.totalVapes >= 100 },
  { id: 'sommelier',    icon: '🍷', name: 'Sommelier',         desc: 'Log 50 total drinks.',                       color: DUO.purple, check: s => s.totalDrinks >= 50 },
  { id: 'zero-wellness',icon: '🫀', name: 'Zero Wellness',     desc: 'Bring your Wellness Score™ to 0.',           color: DUO.red,    check: s => (100 - s.todayVapes * 4 - s.todayDrinks * 3) <= 0 },
]

// ── Build this-week BAC chart data ───────────────
function weekBacData(bacEntries) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return days.map((day, i) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + i)
    const dateStr = date.toDateString()
    const entries = bacEntries.filter(e => new Date(e.timestamp).toDateString() === dateStr)
    const avg = entries.length ? entries.reduce((s, e) => s + e.bac, 0) / entries.length : null
    return { day, bac: avg !== null ? parseFloat(avg.toFixed(3)) : null }
  })
}

export default function ProfileTab({ stats, bacEntries }) {
  const { totalVapes, totalDrinks, streak, xp, totalBac, wellnessScore, todayVapes, todayDrinks } = stats
  const badgeStats = { totalVapes, totalDrinks, streak, todayVapes, todayDrinks }
  const [selectedBadge, setSelectedBadge] = useState(null)

  const DEMO_BAC = [
    { day: 'Sun', bac: 0.042 },
    { day: 'Mon', bac: 0.0 },
    { day: 'Tue', bac: 0.078 },
    { day: 'Wed', bac: 0.0 },
    { day: 'Thu', bac: 0.091 },
    { day: 'Fri', bac: 0.110 },
    { day: 'Sat', bac: 0.084 },
  ]
  const realData = weekBacData(bacEntries)
  const hasRealData = realData.some(d => d.bac !== null)
  const chartData = hasRealData
    ? realData.map((d, i) => ({ ...d, bac: d.bac ?? DEMO_BAC[i].bac }))
    : DEMO_BAC

  // streak in "weeks"
  const streakWeeks = Math.max(1, Math.round(streak / 7)) || 1

  return (
    <div className="prof-screen">
      {/* ── Avatar + name ── */}
      <div className="prof-hero">
        <div className="prof-avatar">
          <span>GS</span>
        </div>
        <h1 className="prof-name">Grindset User</h1>

        {/* ── Stat pills ── */}
        <div className="prof-pills">
          <div className="prof-pill prof-pill--green">
            <span className="prof-pill-val">{(xp + DEMO_BOOST.xp).toLocaleString()}</span>
            <span className="prof-pill-label">XP</span>
          </div>
          <div className="prof-pill prof-pill--blue">
            <span className="prof-pill-val">{streakWeeks + DEMO_BOOST.weeks} 🔥</span>
            <span className="prof-pill-label">{(streakWeeks + DEMO_BOOST.weeks) === 1 ? 'week' : 'weeks'}</span>
          </div>
        </div>
      </div>

      <div className="prof-body">
        {/* ── This week's BAC ── */}
        <div className="prof-section-title">this week's bac</div>
        <div className="prof-bac-card">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 'auto']} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 12 }}
                formatter={v => [`${v} g/dL`, 'BAC']}
              />
              <Line
                type="monotone"
                dataKey="bac"
                stroke={DUO.blue}
                strokeWidth={3}
                dot={{ fill: DUO.blue, r: 4, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Friend streaks ── */}
        <div className="prof-section-title">friend streaks</div>
        <div className="prof-friends-card">
          {FRIENDS.map(f => (
            <div key={f.name} className="prof-friend-row">
              <div className="prof-friend-left">
                <div className="prof-friend-avatar">{f.emoji}</div>
                <span className="prof-friend-name">{f.name}</span>
              </div>
              <div className="prof-friend-streak">
                <span className="prof-friend-weeks">{f.weeks}</span>
                <span className="prof-friend-wlabel"> {f.weeks === 1 ? 'week' : 'weeks'}</span>
                <span className="prof-friend-fire"> 🔥</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <div className="prof-section-title">badges</div>
        <div className="prof-badges-grid">
          {BADGES.map(b => {
            const earned = b.img || b.check(badgeStats)
            return (
              <div
                key={b.id}
                className={`prof-badge${earned ? ' prof-badge--earned' : ''}`}
                onClick={() => setSelectedBadge({ ...b, earned })}
              >
                <div
                  className="prof-badge-circle"
                  style={earned && !b.img ? { background: b.color, boxShadow: `0 4px 12px ${b.color}55` } : {}}
                >
                  {b.img
                    ? <img src={b.img} alt={b.name} className="prof-badge-img" />
                    : <span>{earned ? b.icon : '🔒'}</span>
                  }
                </div>
                <span className="prof-badge-name">{b.name.toLowerCase()}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Badge detail modal ── */}
      {selectedBadge && (
        <div className="badge-modal-overlay" onClick={() => setSelectedBadge(null)}>
          <div className="badge-modal" onClick={e => e.stopPropagation()}>
            <div
              className="badge-modal-circle"
              style={selectedBadge.earned && !selectedBadge.img
                ? { background: selectedBadge.color, boxShadow: `0 6px 20px ${selectedBadge.color}66` }
                : {}}
            >
              {selectedBadge.img
                ? <img src={selectedBadge.img} alt={selectedBadge.name} className="badge-modal-img" />
                : <span>{selectedBadge.earned ? selectedBadge.icon : '🔒'}</span>
              }
            </div>
            <div className={`badge-modal-status${selectedBadge.earned ? ' badge-modal-status--earned' : ''}`}>
              {selectedBadge.earned ? 'unlocked' : 'locked'}
            </div>
            <div className="badge-modal-name">{selectedBadge.name.toLowerCase()}</div>
            <div className="badge-modal-desc">{selectedBadge.desc}</div>
            <button className="badge-modal-close" onClick={() => setSelectedBadge(null)}>done</button>
          </div>
        </div>
      )}
    </div>
  )
}
