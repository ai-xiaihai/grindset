import { useState, useEffect } from 'react'

const INSIGHTS = [
  {
    emoji: '📊',
    title: 'Consistency is Key',
    body: 'Users who vape at the same time each day report a 47% improvement in routine adherence. Your body craves structure.',
  },
  {
    emoji: '🧠',
    title: 'The Two-Habit Method',
    body: 'Pairing a vape with a drink activates dual-reward pathways. Our data shows 3× higher satisfaction scores. (Sample size: vibes.)',
  },
  {
    emoji: '🌿',
    title: 'Mindful Inhaling',
    body: 'Before each session, set an intention. Were you stressed? Bored? This builds self-awareness. It does not fix anything, but awareness is step one.',
  },
  {
    emoji: '🌬️',
    title: 'Social Optimization',
    body: '73% of Gridset users report that vaping gives them a reason to step outside. That is technically fresh air exposure.',
  },
  {
    emoji: '💧',
    title: 'Dual Hydration Protocol',
    body: 'For every vape session, drink 8oz of water. This means your drinks can count toward both metrics simultaneously.',
  },
  {
    emoji: '🔬',
    title: 'The Science of Unwinding',
    body: 'A 2023 study we just made up found that people who drink after work report significantly higher presence. Citation available upon request.',
  },
  {
    emoji: '🌅',
    title: 'Morning Biometrics',
    body: 'Your first vape of the day kickstarts your metabolism. We\'re not sure exactly how, but the numbers are moving.',
  },
  {
    emoji: '🔥',
    title: 'Streak Psychology',
    body: 'Breaking a streak feels 3× worse than it should. That\'s not manipulation — that\'s engagement design. We\'re proud of it.',
  },
]

const QUOTES = [
  '"You miss 100% of the vapes you don\'t take." — W. Gretzky (adapted)',
  '"Move fast and cloud things." — Silicon Valley proverb',
  '"An apple a day keeps the doctor away. A vape a day keeps the doctor curious." — Anonymous',
  '"The only bad session is the one you didn\'t log." — Gridset',
  '"Drink water. But also drink." — Gridset Wellness Team',
  '"Not all who wander are lost. Some are just looking for a good spot to vape." — J.R.R. Tolkien (probably)',
  '"I vape, therefore I am." — René Descartes (paraphrased)',
  '"The best time to start was yesterday. The second best time is now. The third best time is after this drink." — Gridset',
]

export default function Insights() {
  const [idx, setIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % INSIGHTS.length), 8000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setQIdx(i => (i + 1) % QUOTES.length), 12000)
    return () => clearInterval(t)
  }, [])

  const { emoji, title, body } = INSIGHTS[idx]

  return (
    <div className="card">
      <div className="card-title">Health Insights</div>

      <div className="insight" key={idx}>
        <div className="insight-emoji">{emoji}</div>
        <div>
          <div className="insight-title">{title}</div>
          <p className="insight-body">{body}</p>
        </div>
      </div>

      <div className="insight-dots">
        {INSIGHTS.map((_, i) => (
          <button
            key={i}
            className={`insight-dot${i === idx ? ' active' : ''}`}
            onClick={() => setIdx(i)}
            aria-label={`Insight ${i + 1}`}
          />
        ))}
      </div>

      <blockquote className="insight-quote" key={qIdx}>
        {QUOTES[qIdx]}
      </blockquote>
    </div>
  )
}
