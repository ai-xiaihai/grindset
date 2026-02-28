import { useState, useRef, useEffect } from 'react'

function getBACLabel(bac) {
  if (bac < 0.02) return { text: 'Clinically Sober — Address this immediately', color: 'slate' }
  if (bac < 0.05) return { text: 'Warming Up — Promising trajectory', color: 'green' }
  if (bac < 0.08) return { text: 'Socially Optimized — Peak networking window', color: 'teal' }
  if (bac < 0.12) return { text: 'Legally Interesting — Approach with caution', color: 'amber' }
  if (bac < 0.20) return { text: 'Wellness Peak™ — Do not send emails', color: 'orange' }
  if (bac < 0.30) return { text: 'Transcendent — You are beyond this realm', color: 'red' }
  return { text: 'Legendary — Please sit down', color: 'red' }
}

export default function BACLogger({ onAdd }) {
  const [bac, setBac] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [lastAdded, setLastAdded] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = async () => {
    setCameraError(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      })
      setStream(s)
      setShowCamera(true)
    } catch {
      setCameraError('Camera access denied — log BAC manually above.')
    }
  }

  useEffect(() => {
    if (showCamera && videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [showCamera, stream])

  useEffect(() => {
    return () => { if (stream) stream.getTracks().forEach(t => t.stop()) }
  }, [stream])

  const capture = () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = 320
    canvas.height = 240
    canvas.getContext('2d').drawImage(video, 0, 0, 320, 240)
    setPhoto(canvas.toDataURL('image/jpeg', 0.72))
    stopCamera()
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(t => t.stop())
    setStream(null)
    setShowCamera(false)
  }

  const handleLog = () => {
    const val = parseFloat(bac)
    if (!bac || isNaN(val) || val < 0) return
    onAdd(val, photo)
    setBac('')
    setPhoto(null)
    setLastAdded(true)
    setTimeout(() => setLastAdded(false), 2500)
  }

  const parsed = parseFloat(bac)
  const label = bac && !isNaN(parsed) ? getBACLabel(parsed) : null

  return (
    <div className="card">
      <div className="card-title">BAC Logger</div>
      <p className="form-subtitle">Document your blood alcohol content. For science.</p>

      <div className="form-group">
        <label className="form-label">BAC Reading</label>
        <div className="bac-input-wrap">
          <input
            className="form-input bac-input"
            type="number"
            step="0.001"
            min="0"
            max="0.5"
            placeholder="0.000"
            value={bac}
            onChange={e => setBac(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
          />
          <span className="bac-unit">g/dL</span>
        </div>
        {label && (
          <div className={`bac-level bac-level--${label.color}`}>
            {label.text}
          </div>
        )}
      </div>

      {!showCamera && !photo && (
        <button className="btn btn-camera" onClick={startCamera}>
          📸 Scan Breathalyzer
        </button>
      )}

      {cameraError && (
        <p className="bac-camera-error">{cameraError}</p>
      )}

      {photo && (
        <div className="photo-preview">
          <img src={photo} alt="Breathalyzer reading" className="photo-thumb" />
          <div className="photo-meta">
            <span className="photo-confirmed">✓ Evidence captured</span>
            <div className="photo-actions">
              <button className="btn-link" onClick={() => { setPhoto(null); startCamera() }}>Retake</button>
              <button className="btn-link" onClick={() => setPhoto(null)}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="camera-container">
          <video ref={videoRef} autoPlay playsInline className="camera-feed" />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <div className="camera-viewfinder" />
          <div className="camera-controls">
            <button className="btn btn-capture" onClick={capture}>● Capture</button>
            <button className="btn-link btn-link--light" onClick={stopCamera}>Cancel</button>
          </div>
        </div>
      )}

      <button
        className="btn btn-bac"
        onClick={handleLog}
        disabled={!bac || isNaN(parsed)}
      >
        🩸 Log BAC Reading
      </button>

      {lastAdded && (
        <div className="form-success form-success--bac">
          ✓ BAC logged. Your biometrics have been updated.
        </div>
      )}
    </div>
  )
}
