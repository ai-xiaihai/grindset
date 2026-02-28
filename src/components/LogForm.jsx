import { useState } from 'react'

export default function LogForm({ onAdd }) {
  const [note, setNote] = useState('')
  const [lastAdded, setLastAdded] = useState(null)

  const handle = (type) => {
    onAdd(type, note.trim())
    setLastAdded(type)
    setNote('')
    setTimeout(() => setLastAdded(null), 2500)
  }

  const successMsg = {
    vape: "Vape session recorded. You're crushing it.",
    drink: 'Drink logged. Hydration optimized.',
  }

  return (
    <div className="card">
      <div className="card-title">Log Entry</div>
      <p className="form-subtitle">Record your wellness activity below.</p>

      <div className="form-group">
        <label className="form-label">
          Session Note <span>(optional)</span>
        </label>
        <input
          className="form-input"
          type="text"
          placeholder="e.g. post-meeting, morning ritual, networking..."
          value={note}
          onChange={e => setNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle('vape')}
        />
      </div>

      <div className="form-buttons">
        <button className="btn btn-vape" onClick={() => handle('vape')}>
          💨 Log Vape
        </button>
        <button className="btn btn-drink" onClick={() => handle('drink')}>
          🥃 Log Drink
        </button>
      </div>

      {lastAdded && (
        <div className={`form-success form-success--${lastAdded}`}>
          ✓ {successMsg[lastAdded]}
        </div>
      )}
    </div>
  )
}
