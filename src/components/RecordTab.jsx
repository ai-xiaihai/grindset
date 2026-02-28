import { useState, useEffect, useRef } from 'react'
import heroImg from '../assets/record/hero.png'

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
    lg: { padding: '38px 0', fontSize: 22, radius: 20 },
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
        <img src={heroImg} alt="" className="rec-owl" style={{ width: 200, height: 200, objectFit: 'contain' }} />
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

// ── Screen: Add BAC ───────────────────────────────
function AddBacScreen({ onBack, onPost }) {
  const [bac, setBac]                 = useState('')
  const [comment, setComment]         = useState('')
  const [breathPhoto, setBreathPhoto] = useState(null)
  const [socialPhoto, setSocialPhoto] = useState(null)
  const [genericPhoto, setGenericPhoto] = useState(null)
  const [scanning, setScanning]       = useState(false)
  const [showCamera, setShowCamera]   = useState(false)
  const [stream, setStream]           = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const breathRef  = useRef()
  const socialRef  = useRef()
  const videoRef   = useRef()
  const canvasRef  = useRef()

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [showCamera, stream])

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  const startCamera = async () => {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(s)
      setShowCamera(true)
    } catch {
      setCameraError('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }

  const capturePhoto = () => {
    const canvas = canvasRef.current
    const video  = videoRef.current
    canvas.width  = video.videoWidth  || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setGenericPhoto(dataUrl)
    stopCamera()
  }

  const readFile = (file, setter) => {
    const reader = new FileReader()
    reader.onload = () => setter(reader.result)
    reader.readAsDataURL(file)
  }

  const handleBreathChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    readFile(file, (url) => {
      setBreathPhoto(url)
      setScanning(true)
      setTimeout(() => { setScanning(false); setBac('0.020') }, 2400)
    })
  }

  const parsed = parseFloat(bac)
  const canPost = bac !== '' && !isNaN(parsed) && parsed >= 0

  // Camera mode: full-screen, no fixed positioning
  if (showCamera) return (
    <div className="addbac-cam-screen">
      <video ref={videoRef} autoPlay playsInline className="addbac-cam-video" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="addbac-cam-controls">
        <button className="addbac-capture-btn" onClick={capturePhoto}>⬤</button>
        <button className="addbac-cancel-link" onClick={stopCamera}>cancel</button>
      </div>
    </div>
  )

  return (
    <div className="rec-screen rec-screen--addbac">
      <div className="addbac-header">
        <button className="addbac-back" onClick={onBack}>← back</button>
        <span className="addbac-title">🩸 add bac</span>
      </div>

      <div className="addbac-body">
        {/* BAC Amount */}
        <div className="addbac-field">
          <label className="addbac-label">BAC Amount</label>
          <div className="addbac-bac-row">
            <input
              className={`addbac-input${scanning ? ' addbac-input--flash' : ''}`}
              type="number"
              step="0.001"
              min="0"
              max="0.5"
              placeholder="0.000"
              value={bac}
              onChange={e => setBac(e.target.value)}
            />
            <span className="addbac-unit">g/dL</span>
          </div>
        </div>

        {/* Comment */}
        <div className="addbac-field">
          <label className="addbac-label">Comment</label>
          <textarea
            className="addbac-textarea"
            placeholder="how we feeling rn…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />
        </div>

        {/* Scanning indicator */}
        {scanning && (
          <div className="addbac-scan-bar">
            <span className="addbac-scan-pulse" />
            scanning breathalyzer…
          </div>
        )}

        {cameraError && <p className="addbac-camera-error">{cameraError}</p>}

        {/* Photo buttons */}
        <div className="addbac-photo-actions">
          <input ref={breathRef} type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={handleBreathChange} />
          <input ref={socialRef} type="file" accept="image/*" capture="environment" style={{display:'none'}}
            onChange={e => e.target.files[0] && readFile(e.target.files[0], setSocialPhoto)} />

          <button className="addbac-pb" onClick={startCamera}>
            📷 add photo
          </button>
          <button className="addbac-pb addbac-pb--breath" onClick={() => breathRef.current.click()} disabled={scanning}>
            🫁 breathalyzer photo
          </button>
          <button className="addbac-pb addbac-pb--social" onClick={() => socialRef.current.click()}>
            🤳 add social photo
          </button>
        </div>

        {/* Previews */}
        {(genericPhoto || breathPhoto || socialPhoto) && (
          <div className="addbac-previews">
            {genericPhoto && (
              <div className="addbac-preview">
                <img src={genericPhoto} alt="Photo" className="addbac-preview-img" />
                <span className="addbac-preview-tag">photo</span>
                <button className="addbac-preview-del" onClick={() => setGenericPhoto(null)}>✕</button>
              </div>
            )}
            {breathPhoto && (
              <div className="addbac-preview">
                <img src={breathPhoto} alt="Breathalyzer" className="addbac-preview-img" />
                <span className="addbac-preview-tag">breathalyzer</span>
                <button className="addbac-preview-del" onClick={() => setBreathPhoto(null)}>✕</button>
              </div>
            )}
            {socialPhoto && (
              <div className="addbac-preview">
                <img src={socialPhoto} alt="Social" className="addbac-preview-img" />
                <span className="addbac-preview-tag">social</span>
                <button className="addbac-preview-del" onClick={() => setSocialPhoto(null)}>✕</button>
              </div>
            )}
          </div>
        )}

        {/* Post */}
        <div style={{ marginTop: 8 }}>
          <DuoBtn
            label={canPost ? '🩸  post to feed' : 'enter bac to post'}
            color={canPost ? C.blue : '#94a3b8'}
            shadow={canPost ? C.blueShadow : '#64748b'}
            onClick={() => { if (canPost) onPost(parsed, breathPhoto, comment.trim(), socialPhoto, genericPhoto) }}
            size="lg"
          />
        </div>
        <DuoBtn label="cancel" color={C.red} shadow={C.redShadow} onClick={onBack} size="sm" outline />
      </div>
    </div>
  )
}

// ── Main RecordTab ────────────────────────────────
export default function RecordTab({ onAddEntry, onAddBac, onNavigate }) {
  const [phase, setPhase]     = useState('idle')   // idle | addbac | running | paused | done
  const [elapsed, setElapsed] = useState(0)
  const [bacCount, setBacCount] = useState(0)
  const [cigCount, setCigCount] = useState(0)
  const returnPhaseRef = useRef('idle')
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

  const goToAddBac = (from) => {
    returnPhaseRef.current = from
    setPhase('addbac')
  }

  const handlePost = (bac, breathPhoto, comment, socialPhoto, genericPhoto) => {
    onAddBac(bac, breathPhoto, comment, socialPhoto, genericPhoto)
    if (returnPhaseRef.current === 'running') {
      setBacCount(c => c + 1)
      setPhase('running')
    } else {
      setPhase('idle')
      onNavigate('feed')
    }
  }

  if (phase === 'addbac') return (
    <AddBacScreen
      onBack={() => setPhase(returnPhaseRef.current)}
      onPost={handlePost}
    />
  )

  if (phase === 'idle') return (
    <IdleScreen
      onStartNight={() => setPhase('running')}
      onAddBac={() => goToAddBac('idle')}
      onAddCig={handleAddCig}
    />
  )

  if (phase === 'running') return (
    <RunningScreen
      elapsed={elapsed}
      bacCount={bacCount}
      cigCount={cigCount}
      onAddBac={() => goToAddBac('running')}
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
