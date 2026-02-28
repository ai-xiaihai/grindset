const ACHIEVEMENTS = [
  {
    id: 'first-vape',
    icon: '💨',
    name: 'first inhale',
    desc: 'log your very first vape session.',
    check: ({ totalVapes }) => totalVapes >= 1,
  },
  {
    id: 'two-fisted',
    icon: '⚔️',
    name: 'two-fisted warrior',
    desc: 'log a vape and a drink on the same day.',
    check: ({ todayVapes, todayDrinks }) => todayVapes > 0 && todayDrinks > 0,
  },
  {
    id: 'cloud-chaser',
    icon: '☁️',
    name: 'cloud chaser',
    desc: 'log 10 vape sessions in a single day.',
    check: ({ todayVapes }) => todayVapes >= 10,
  },
  {
    id: 'open-bar',
    icon: '🍸',
    name: 'open bar',
    desc: 'log 5 drinks in a single day.',
    check: ({ todayDrinks }) => todayDrinks >= 5,
  },
  {
    id: 'consistency',
    icon: '👑',
    name: 'consistency king',
    desc: 'maintain a 3-day streak.',
    check: ({ streak }) => streak >= 3,
  },
  {
    id: 'devoted',
    icon: '🏆',
    name: 'devoted practitioner',
    desc: 'maintain a 7-day streak.',
    check: ({ streak }) => streak >= 7,
  },
  {
    id: 'quantified',
    icon: '📱',
    name: 'quantified self',
    desc: 'log 5+ vapes and 5+ drinks total.',
    check: ({ totalVapes, totalDrinks }) => totalVapes >= 5 && totalDrinks >= 5,
  },
  {
    id: 'centurion',
    icon: '💯',
    name: 'centurion',
    desc: 'log 100 total vape sessions.',
    check: ({ totalVapes }) => totalVapes >= 100,
  },
  {
    id: 'sommelier',
    icon: '🍷',
    name: 'amateur sommelier',
    desc: 'log 50 total drinks.',
    check: ({ totalDrinks }) => totalDrinks >= 50,
  },
  {
    id: 'wellness-zero',
    icon: '🫀',
    name: 'zero wellness',
    desc: 'bring your Wellness Score™ to 0.',
    check: ({ todayVapes, todayDrinks }) => (100 - todayVapes * 4 - todayDrinks * 3) <= 0,
  },
]

export default function Achievements({ todayVapes, todayDrinks, streak, totalVapes, totalDrinks }) {
  const stats = { todayVapes, todayDrinks, streak, totalVapes, totalDrinks }
  const earned = ACHIEVEMENTS.filter(a => a.check(stats))
  const locked = ACHIEVEMENTS.filter(a => !a.check(stats))

  return (
    <div className="card">
      <div className="card-title">
        Achievements
        <span className="achievement-count">{earned.length}/{ACHIEVEMENTS.length}</span>
      </div>

      {earned.length === 0 && (
        <p className="achievement-empty">
          start logging to unlock achievements.<br />your potential is completely untapped.
        </p>
      )}

      {earned.length > 0 && (
        <div className="achievement-list">
          {earned.map(a => (
            <div key={a.id} className="achievement achievement--earned">
              <span className="achievement-icon">{a.icon}</span>
              <div>
                <div className="achievement-name">{a.name}</div>
                <div className="achievement-desc">{a.desc}</div>
              </div>
              <span className="achievement-check">✓</span>
            </div>
          ))}
        </div>
      )}

      {locked.length > 0 && (
        <>
          <div className="achievement-divider">locked</div>
          <div className="achievement-list">
            {locked.slice(0, 4).map(a => (
              <div key={a.id} className="achievement achievement--locked">
                <span className="achievement-icon achievement-icon--locked">🔒</span>
                <div>
                  <div className="achievement-name achievement-name--locked">{a.name}</div>
                  <div className="achievement-desc">{a.desc}</div>
                </div>
              </div>
            ))}
            {locked.length > 4 && (
              <p className="achievement-more">+{locked.length - 4} more to discover</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
