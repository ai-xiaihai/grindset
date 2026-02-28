import { useState, useEffect, useRef } from 'react'

// ── Duolingo palette ──────────────────────────────
const C = {
  green:  '#58CC02', greenShadow: '#46A302',
  blue:   '#1CB0F6', blueShadow:  '#0A91CC',
  purple: '#CE82FF', purpleShadow:'#A855F7',
  red:    '#FF4B4B', redShadow:   '#CC3333',
  orange: '#FF9600', orangeShadow:'#CC7800',
  yellow: '#FFD900', yellowShadow:'#CCA800',
}

function fmt(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function DuoBtn({ label, color, shadow, onClick, size = 'md', outline = false }) {
  const sizes = {
    lg: { padding: '18px 0', fontSize: 20, radius: 18 },
    md: { padding: '14px 0', fontSize: 17, radius: 16 },
    sm: { padding: '11px 0', fontSize: 15, radius: 14 },
  }
  const s = sizes[size]
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: s.padding,
        fontSize: s.fontSize,
        fontWeight: 800,
        fontFamily: 'inherit',
        borderRadius: s.radius,
        border: outline ? `3px solid ${color}` : 'none',
        background: outline ? '#fff' : color,
        color: outline ? color : '#fff',
        boxShadow: outline ? 'none' : `0 5px 0 ${shadow}`,
        cursor: 'pointer',
        letterSpacing: '-0.2px',
        transition: 'transform 0.08s, box-shadow 0.08s',
        userSelect: 'none',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = outline ? 'none' : `0 2px 0 ${shadow}` }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = outline ? 'none' : `0 5px 0 ${shadow}` }}
      onTouchStart={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = outline ? 'none' : `0 2px 0 ${shadow}` }}
      onTouchEnd={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = outline ? 'none' : `0 5px 0 ${shadow}` }}
    >
      {label}
    </button>
  )
}

// ── Screen 1: Idle ────────────────────────────────
function IdleScreen({ onStartNight, onAddBac, onAddCig }) {
  return (
    <div className="rec-screen">
      <div className="rec-top">
        <div className="rec-owl">🍻</div>
        <h1 className="rec-title">record</h1>
        <p className="rec-subtitle">what are we tracking tonight?</p>
      </div>
      <div className="rec-actions">
        <DuoBtn label="🩸  add bac" color={C.blue}   shadow={C.blueShadow}   onClick={onAddBac}     size="md" />
        <DuoBtn label="🚬  add cig" color={C.purple} shadow={C.purpleShadow} onClick={onAddCig}     size="md" />
        <DuoBtn label="🌙  start a night out" color={C.orange} shadow={C.orangeShadow} onClick={onStartNight} size="lg" />
      </div>
    </div>
  )
}

// ── Screen 2/3: Running ───────────────────────────
function RunningScreen({ elapsed, bacCount, cigCount, onAddBac, onAddCig, onPause }) {
  const isEarly = elapsed < 120
  return (
    <div className="rec-screen">
      <div className="rec-top">
        <div className="rec-timer-label">night out</div>
        <div className="rec-timer">{fmt(elapsed)}</div>
        <div className="rec-counters">
          {bacCount > 0 && <span className="rec-counter rec-counter--blue">🩸 {bacCount} bac</span>}
          {cigCount > 0 && <span className="rec-counter rec-counter--purple">🚬 {cigCount} cig{cigCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      <div className="rec-actions">
        <DuoBtn label="🩸  add bac"   color={C.blue}   shadow={C.blueShadow}   onClick={onAddBac} size="md" />
        <DuoBtn label="🚬  add cig"   color={C.purple} shadow={C.purpleShadow} onClick={onAddCig} size="md" />
        {!isEarly && <DuoBtn label="📸  add photo" color={C.green} shadow={C.greenShadow} onClick={() => {}} size="md" />}
        <div style={{ marginTop: 8 }}>
          <DuoBtn label="pause" color={C.yellow} shadow={C.yellowShadow} onClick={onPause} size="sm" />
        </div>
      </div>
    </div>
  )
}

// ── Screen 4: Paused ─────────────────────────────
function PausedScreen({ elapsed, bacCount, cigCount, onResume, onEnd }) {
  return (
    <div className="rec-screen">
      <div className="rec-top">
        <div className="rec-pause-icon">⏸</div>
        <h2 className="rec-pause-title">night out paused</h2>
        <p className="rec-pause-sub">are you sure you want to stop?</p>
        <div className="rec-summary">
          <div className="rec-summary-row">
            <span className="rec-summary-emoji">⏱</span>
            <span className="rec-summary-val">{fmt(elapsed)}</span>
          </div>
          {bacCount > 0 && (
            <div className="rec-summary-row">
              <span className="rec-summary-emoji">🩸</span>
              <span className="rec-summary-val">{bacCount} bac check-in{bacCount !== 1 ? 's' : ''}</span>
            </div>
          )}
          {cigCount > 0 && (
            <div className="rec-summary-row">
              <span className="rec-summary-emoji">🚬</span>
              <span className="rec-summary-val">{cigCount} cig{cigCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
      <div className="rec-actions">
        <DuoBtn label="it's over" color={C.red}   shadow={C.redShadow}   onClick={onEnd}    size="lg" />
        <DuoBtn label="jk"        color={C.green} shadow={C.greenShadow} onClick={onResume} size="md" />
      </div>
    </div>
  )
}

// ── Screen 5: Done ────────────────────────────────
function DoneScreen({ elapsed, bacCount, cigCount, xp, onDone }) {
  return (
    <div className="rec-screen rec-screen--done">
      <div className="rec-top">
        <div className="rec-done-burst">🎉</div>
        <h2 className="rec-done-title">your night out<br />has been posted!</h2>
        <p className="rec-done-sub">check it out tomorrow lol</p>
        <div className="rec-xp-badge">
          <span className="rec-xp-val">+{xp} XP</span>
        </div>
        <div className="rec-done-stats">
          <span>⏱ {fmt(elapsed)}</span>
          {bacCount > 0 && <span>🩸 {bacCount} bac</span>}
          {cigCount > 0 && <span>🚬 {cigCount} cig{cigCount !== 1 ? 's' : ''}</span>}
        </div>
      </div>
      <div className="rec-actions">
        <DuoBtn label="done" color={C.green} shadow={C.greenShadow} onClick={onDone} size="lg" />
      </div>
    </div>
  )
}

// ── Main RecordTab ────────────────────────────────
export default function RecordTab({ onAddEntry, onAddBac }) {
  const [phase, setPhase]     = useState('idle')   // idle | running | paused | done
  const [elapsed, setElapsed] = useState(0)
  const [bacCount, setBacCount] = useState(0)
  const [cigCount, setCigCount] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (phase === 'running') {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [phase])

  const xpGained = bacCount * 25 + cigCount * 10 + Math.floor(elapsed / 60) * 5

  const handleAddBac = () => {
    onAddBac(0.08)
    setBacCount(c => c + 1)
  }

  const handleAddCig = () => {
    onAddEntry('vape')
    setCigCount(c => c + 1)
  }

  const handleEnd = () => {
    setPhase('done')
  }

  const handleDone = () => {
    setPhase('idle')
    setElapsed(0)
    setBacCount(0)
    setCigCount(0)
  }

  if (phase === 'idle') return (
    <IdleScreen
      onStartNight={() => setPhase('running')}
      onAddBac={handleAddBac}
      onAddCig={handleAddCig}
    />
  )

  if (phase === 'running') return (
    <RunningScreen
      elapsed={elapsed}
      bacCount={bacCount}
      cigCount={cigCount}
      onAddBac={handleAddBac}
      onAddCig={handleAddCig}
      onPause={() => setPhase('paused')}
    />
  )

  if (phase === 'paused') return (
    <PausedScreen
      elapsed={elapsed}
      bacCount={bacCount}
      cigCount={cigCount}
      onResume={() => setPhase('running')}
      onEnd={handleEnd}
    />
  )

  return (
    <DoneScreen
      elapsed={elapsed}
      bacCount={bacCount}
      cigCount={cigCount}
      xp={xpGained}
      onDone={handleDone}
    />
  )
}
