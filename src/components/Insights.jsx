import { useState, useEffect } from 'react'

const INSIGHTS = [
  {
    emoji: '📊',
    title: 'consistency is key',
    body: 'users who vape at the same time each day report a 47% improvement in routine adherence. your body craves structure.',
  },
  {
    emoji: '🧠',
    title: 'the two-habit method',
    body: 'pairing a vape with a drink activates dual-reward pathways. our data shows 3× higher satisfaction scores. (sample size: vibes.)',
  },
  {
    emoji: '🌿',
    title: 'mindful inhaling',
    body: 'before each session, set an intention. were you stressed? bored? this builds self-awareness. it does not fix anything, but awareness is step one.',
  },
  {
    emoji: '🌬️',
    title: 'social optimization',
    body: '73% of grindset users report that vaping gives them a reason to step outside. that is technically fresh air exposure.',
  },
  {
    emoji: '💧',
    title: 'dual hydration protocol',
    body: 'for every vape session, drink 8oz of water. this means your drinks can count toward both metrics simultaneously.',
  },
  {
    emoji: '🔬',
    title: 'the science of unwinding',
    body: 'a 2023 study we just made up found that people who drink after work report significantly higher presence. citation available upon request.',
  },
  {
    emoji: '🌅',
    title: 'morning biometrics',
    body: 'your first vape of the day kickstarts your metabolism. we\'re not sure exactly how, but the numbers are moving.',
  },
  {
    emoji: '🔥',
    title: 'streak psychology',
    body: 'breaking a streak feels 3× worse than it should. that\'s not manipulation — that\'s engagement design. we\'re proud of it.',
  },
]

const QUOTES = [
  '"You miss 100% of the vapes you don\'t take." — W. Gretzky (adapted)',
  '"Move fast and cloud things." — Silicon Valley proverb',
  '"An apple a day keeps the doctor away. A vape a day keeps the doctor curious." — Anonymous',
  '"The only bad session is the one you didn\'t log." — Grindset',
  '"Drink water. But also drink." — Grindset Wellness Team',
  '"Not all who wander are lost. Some are just looking for a good spot to vape." — J.R.R. Tolkien (probably)',
  '"I vape, therefore I am." — René Descartes (paraphrased)',
  '"The best time to start was yesterday. The second best time is now. The third best time is after this drink." — Grindset',
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
      <div className="card-title">health insights</div>

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
