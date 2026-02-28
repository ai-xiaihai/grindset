import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ReferenceArea
} from 'recharts'

const ZONES = [
  { y1: 0,    y2: 0.02, label: 'Sober',              fill: '#f8fafc', stroke: '#cbd5e1' },
  { y1: 0.02, y2: 0.05, label: 'Warming Up',          fill: '#ecfdf5', stroke: '#6ee7b7' },
  { y1: 0.05, y2: 0.08, label: 'Socially Optimized',  fill: '#d1fae5', stroke: '#34d399' },
  { y1: 0.08, y2: 0.15, label: 'Legally Interesting', fill: '#fef3c7', stroke: '#fcd34d' },
  { y1: 0.15, y2: 0.25, label: 'Wellness Peak™',      fill: '#fee2e2', stroke: '#fca5a5' },
  { y1: 0.25, y2: 0.50, label: 'Transcendent',        fill: '#fce7f3', stroke: '#f9a8d4' },
]

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function getZone(bac) {
  return ZONES.slice().reverse().find(z => bac >= z.y1) || ZONES[0]
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const zone = getZone(d.bac)
  return (
    <div className="bac-tooltip">
      <div className="bac-tooltip-bac">{d.bac.toFixed(3)} <span>g/dL</span></div>
      <div className="bac-tooltip-zone" style={{ color: zone.stroke }}>{zone.label}</div>
      <div className="bac-tooltip-time">{fmtTime(d.timestamp)}</div>
      {d.photo && <img src={d.photo} alt="evidence" className="bac-tooltip-img" />}
    </div>
  )
}

const CustomDot = ({ cx, cy, payload }) => {
  if (!payload?.photo) return <circle cx={cx} cy={cy} r={4} fill="#dc2626" stroke="white" strokeWidth={2} />
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#dc2626" stroke="white" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={3} fill="white" />
    </g>
  )
}

export default function BACGraph({ entries }) {
  const today = new Date().toDateString()
  const todayData = entries
    .filter(e => new Date(e.timestamp).toDateString() === today)
    .slice()
    .reverse()

  const allData = entries.slice().reverse()
  const hasPhotos = entries.some(e => e.photo)

  if (entries.length === 0) {
    return (
      <div className="card">
        <div className="card-title">BAC Timeline</div>
        <div className="timeline-empty">
          <p>No BAC readings yet.</p>
          <p className="timeline-empty-sub">Log your first reading to begin charting your wellness journey.</p>
        </div>
      </div>
    )
  }

  const chartData = (todayData.length > 0 ? todayData : allData.slice(0, 20))
    .filter(e => e.bac != null && !isNaN(e.bac))
  if (chartData.length === 0) return null
  const maxBac = Math.max(...chartData.map(e => e.bac), 0.10)
  const yMax = Math.min(maxBac * 1.25 + 0.01, 0.50)

  return (
    <div className="card">
      <div className="card-title">
        BAC Timeline
        <span className="bac-disclaimer">for entertainment purposes only</span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 8, right: 48, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

          {ZONES.map(z => (
            z.y1 < yMax && (
              <ReferenceArea
                key={z.label}
                y1={z.y1}
                y2={Math.min(z.y2, yMax)}
                fill={z.fill}
                fillOpacity={0.8}
                stroke="none"
              />
            )
          ))}

          <ReferenceLine
            y={0.08}
            stroke="#d97706"
            strokeDasharray="5 3"
            strokeWidth={1.5}
            label={{ value: '0.08 legal limit', position: 'right', fontSize: 9, fill: '#d97706', dx: 4 }}
          />

          <XAxis
            dataKey="timestamp"
            tickFormatter={fmtTime}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, yMax]}
            tickFormatter={v => v.toFixed(2)}
            tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
            width={42}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="bac"
            stroke="#dc2626"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: '#dc2626', stroke: 'white', strokeWidth: 2 }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="bac-legend">
        {ZONES.filter(z => z.y1 < yMax).map(z => (
          <div key={z.label} className="bac-legend-item">
            <span className="bac-legend-swatch" style={{ background: z.fill, borderColor: z.stroke }} />
            {z.label}
          </div>
        ))}
      </div>

      {hasPhotos && (
        <div className="bac-evidence">
          <div className="bac-evidence-title">Breathalyzer Evidence</div>
          <div className="bac-evidence-row">
            {entries.filter(e => e.photo).slice(0, 8).map(e => (
              <div key={e.id} className="bac-evidence-item">
                <img src={e.photo} alt="breathalyzer" />
                <span>{e.bac != null ? Number(e.bac).toFixed(3) : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
