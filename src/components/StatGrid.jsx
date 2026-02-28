function StatCard({ label, value, unit, color, trend, subtext }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        <span className="stat-number" key={value}>{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {trend && <div className="stat-trend">{trend}</div>}
      {subtext && <div className="stat-subtext">{subtext}</div>}
    </div>
  )
}

export default function StatGrid({ todayVapes, todayDrinks, wellnessScore, streak, totalVapes, totalDrinks }) {
  const scoreColor = wellnessScore > 70 ? 'green' : wellnessScore > 40 ? 'amber' : 'red'
  const scoreTrend = wellnessScore === 100
    ? '✓ Untouched. For now.'
    : wellnessScore > 70 ? '↓ Optimizing steadily'
    : wellnessScore > 40 ? '↓ Significant progress'
    : '↓ Peak optimization'

  return (
    <div className="stat-grid">
      <StatCard
        label="Vape Sessions Today"
        value={todayVapes}
        color="teal"
        trend={todayVapes === 0 ? 'Ready for launch' : `↑ ${todayVapes} cloud${todayVapes !== 1 ? 's' : ''} released`}
        subtext="nicotine delivery events"
      />
      <StatCard
        label="Drinks Consumed"
        value={todayDrinks}
        color="amber"
        trend={todayDrinks === 0 ? 'Stay thirsty' : `↑ ${todayDrinks} unit${todayDrinks !== 1 ? 's' : ''} processed`}
        subtext="social hydration sessions"
      />
      <StatCard
        label="Wellness Score™"
        value={wellnessScore}
        unit="/100"
        color={scoreColor}
        trend={scoreTrend}
        subtext="proprietary biometric index"
      />
      <StatCard
        label="Day Streak"
        value={streak}
        color="purple"
        trend={streak === 0 ? 'Your journey awaits' : streak >= 7 ? '🔥 Unstoppable' : '🔥 Keep going'}
        subtext="consecutive days logged"
      />
      <StatCard
        label="All-Time Vapes"
        value={totalVapes}
        color="slate"
        trend="lifetime achievement"
        subtext="cumulative lung optimization"
      />
      <StatCard
        label="All-Time Drinks"
        value={totalDrinks}
        color="slate"
        trend="lifetime achievement"
        subtext="cumulative liver resilience"
      />
    </div>
  )
}
