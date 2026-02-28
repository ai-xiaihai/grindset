import { useState, useRef, useEffect } from 'react'
import { createWorker } from 'tesseract.js'

function getBACLabel(bac) {
  if (bac < 0.02) return { text: 'Clinically Sober — Address this immediately', color: 'slate' }
  if (bac < 0.05) return { text: 'Warming Up — Promising trajectory', color: 'green' }
  if (bac < 0.08) return { text: 'Socially Optimized — Peak networking window', color: 'teal' }
  if (bac < 0.12) return { text: 'Legally Interesting — Approach with caution', color: 'amber' }
  if (bac < 0.20) return { text: 'Wellness Peak™ — Do not send emails', color: 'orange' }
  if (bac < 0.30) return { text: 'Transcendent — You are beyond this realm', color: 'red' }
  return { text: 'Legendary — Please sit down', color: 'red' }
}

/**
 * Preprocess a canvas image for better OCR on digital displays.
 * Returns two data URLs: normal and inverted (for dark-on-light vs light-on-dark displays).
 */
function preprocessCanvas(sourceCanvas) {
  const SCALE = 3
  const w = sourceCanvas.width * SCALE
  const h = sourceCanvas.height * SCALE

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // Scale up for better OCR accuracy
  ctx.drawImage(sourceCanvas, 0, 0, w, h)

  const imgData = ctx.getImageData(0, 0, w, h)
  const d = imgData.data
  const gray = new Uint8Array(w * h)

  // Convert to grayscale
  for (let i = 0; i < gray.length; i++) {
    gray[i] = Math.round(0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2])
  }

  // Contrast stretch
  let lo = 255, hi = 0
  for (const v of gray) { if (v < lo) lo = v; if (v > hi) hi = v }
  const range = hi - lo || 1

  // Apply stretched + threshold
  for (let i = 0; i < gray.length; i++) {
    const stretched = ((gray[i] - lo) / range) * 255
    const val = stretched > 127 ? 255 : 0
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = val
    d[i * 4 + 3] = 255
  }
  ctx.putImageData(imgData, 0, 0)

  const normal = canvas.toDataURL('image/png')

  // Inverted version (for light-on-dark displays like red LED)
  for (let i = 0; i < gray.length; i++) {
    const inv = d[i * 4] === 255 ? 0 : 255
    d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = inv
  }
  ctx.putImageData(imgData, 0, 0)

  const inverted = canvas.toDataURL('image/png')
  return { normal, inverted }
}

/**
 * Try to extract a BAC value (e.g. "0.08") from OCR text.
 * Handles common misreads like "O" for "0", "l" for "1", etc.
 */
function parseBACFromText(raw) {
  const cleaned = raw
    .replace(/[Oo]/g, '0')
    .replace(/[lI|]/g, '1')
    .replace(/[Ss]/g, '5')
    .replace(/[Bb]/g, '8')
    .replace(/[,]/g, '.')
    .replace(/\s/g, '')

  const matches = [...cleaned.matchAll(/(\d*\.?\d+)/g)]
    .map(m => parseFloat(m[0]))
    .filter(n => !isNaN(n) && n >= 0 && n <= 0.45)

  if (!matches.length) return null

  // Prefer values that look like BAC (0.XXX range)
  const bacShaped = matches.filter(n => n < 1.0)
  const candidates = bacShaped.length ? bacShaped : matches
  // Pick the one closest to a plausible BAC midpoint
  return candidates.sort((a, b) => Math.abs(a - 0.08) - Math.abs(b - 0.08))[0]
}

async function runOCR(images, onProgress) {
  const worker = await createWorker('eng', 1, {
    logger: ({ status, progress }) => {
      if (status === 'loading tesseract core') onProgress(Math.round(progress * 20))
      if (status === 'initializing tesseract') onProgress(20 + Math.round(progress * 20))
      if (status === 'loading language traineddata') onProgress(40 + Math.round(progress * 20))
      if (status === 'initializing api') onProgress(60 + Math.round(progress * 10))
      if (status === 'recognizing text') onProgress(70 + Math.round(progress * 30))
    },
  })

  await worker.setParameters({
    tessedit_char_whitelist: '0123456789.',
    tessedit_pageseg_mode: '7', // single text line
  })

  let result = null
  for (const img of images) {
    const { data: { text } } = await worker.recognize(img)
    result = parseBACFromText(text)
    if (result !== null) break
  }

  await worker.terminate()
  return result
}

export default function BACLogger({ onAdd }) {
  const [bac, setBac] = useState('')
  const [showCamera, setShowCamera] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [stream, setStream] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [lastAdded, setLastAdded] = useState(false)

  // OCR state
  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState(null) // 'found' | 'not_found' | null
  const [previewUrl, setPreviewUrl] = useState(null) // preprocessed image for debugging

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = async () => {
    setCameraError(null)
    setScanStatus(null)
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setStream(s)
      setShowCamera(true)
    } catch {
      setCameraError('Camera access denied — enter BAC manually above.')
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

  const capture = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    const photoData = canvas.toDataURL('image/jpeg', 0.85)
    setPhoto(photoData)
    stopCamera()

    // Run OCR
    setScanning(true)
    setScanProgress(0)
    setScanStatus(null)

    try {
      const { normal, inverted } = preprocessCanvas(canvas)
      setPreviewUrl(normal) // show preprocessed image
      const found = await runOCR([normal, inverted, photoData], p => setScanProgress(p))
      if (found !== null) {
        setBac(found.toFixed(3))
        setScanStatus('found')
      } else {
        setScanStatus('not_found')
      }
    } catch (err) {
      console.error('OCR failed:', err)
      setScanStatus('not_found')
    } finally {
      setScanning(false)
      setScanProgress(100)
    }
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
    setPreviewUrl(null)
    setScanStatus(null)
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
            className={`form-input bac-input${scanStatus === 'found' ? ' bac-input--autofilled' : ''}`}
            type="number"
            step="0.001"
            min="0"
            max="0.5"
            placeholder="0.000"
            value={bac}
            onChange={e => { setBac(e.target.value); if (scanStatus) setScanStatus(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
          />
          <span className="bac-unit">g/dL</span>
          {scanStatus === 'found' && <span className="bac-scanned-badge">🔍 scanned</span>}
        </div>
        {label && (
          <div className={`bac-level bac-level--${label.color}`}>
            {label.text}
          </div>
        )}
      </div>

      {!showCamera && !photo && !scanning && (
        <button className="btn btn-camera" onClick={startCamera}>
          📸 Scan Breathalyzer
        </button>
      )}

      {cameraError && <p className="bac-camera-error">{cameraError}</p>}

      {/* Camera */}
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

      {/* Scanning progress */}
      {scanning && (
        <div className="scan-progress">
          <div className="scan-header">
            <span className="scan-spinner" />
            <span className="scan-label">
              {scanProgress < 40 ? 'Loading OCR engine…' : scanProgress < 70 ? 'Preprocessing image…' : 'Reading display…'}
            </span>
            <span className="scan-pct">{scanProgress}%</span>
          </div>
          <div className="scan-bar">
            <div className="scan-bar-fill" style={{ width: `${scanProgress}%` }} />
          </div>
          <p className="scan-subtitle">
            {scanProgress < 60
              ? 'Downloading Tesseract OCR engine (first run only, ~10MB)…'
              : 'Analyzing pixels with cutting-edge (1995) technology…'}
          </p>
        </div>
      )}

      {/* Photo + OCR result */}
      {photo && !scanning && (
        <div className="photo-preview">
          <img src={photo} alt="Breathalyzer reading" className="photo-thumb" />
          {previewUrl && (
            <img src={previewUrl} alt="Preprocessed" className="photo-thumb photo-thumb--processed" title="Preprocessed (what OCR sees)" />
          )}
          <div className="photo-meta">
            {scanStatus === 'found' && (
              <span className="photo-confirmed">🔍 Read {bac} g/dL — correct if needed</span>
            )}
            {scanStatus === 'not_found' && (
              <span className="photo-failed">⚠ Couldn't read display — enter manually</span>
            )}
            {!scanStatus && <span className="photo-confirmed">✓ Evidence captured</span>}
            <div className="photo-actions">
              <button className="btn-link" onClick={() => { setPhoto(null); setPreviewUrl(null); setScanStatus(null); startCamera() }}>Retake</button>
              <button className="btn-link" onClick={() => { setPhoto(null); setPreviewUrl(null); setScanStatus(null) }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <button
        className="btn btn-bac"
        onClick={handleLog}
        disabled={!bac || isNaN(parsed) || scanning}
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
