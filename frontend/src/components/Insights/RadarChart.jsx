const AXES = [
  { key: 'feasibility', label: 'Feasibility' },
  { key: 'scope_clarity', label: 'Scope Clarity' },
  { key: 'tech_readiness', label: 'Tech Readiness' },
  { key: 'timeline_realism', label: 'Timeline Realism' },
  { key: 'risk_safety', label: 'Risk Safety' },
]

function pointOnAxis(index, total, value, maxValue, radius, center) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2
  const r = (value / maxValue) * radius
  return {
    x: center + r * Math.cos(angle),
    y: center + r * Math.sin(angle),
  }
}

export default function RadarChart({ scores, size = 260 }) {
  const center = size / 2
  const radius = size / 2 - 40
  const maxValue = 10

  const dataPoints = AXES.map((axis, i) =>
    pointOnAxis(i, AXES.length, scores[axis.key] || 0, maxValue, radius, center)
  )
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ')

  const gridLevels = [2, 4, 6, 8, 10]

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const points = AXES.map((_, i) =>
          pointOnAxis(i, AXES.length, level, maxValue, radius, center)
        )
        return (
          <polygon
            key={level}
            points={points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#E4E4F5"
            strokeWidth="1"
          />
        )
      })}

      {/* Axis lines */}
      {AXES.map((axis, i) => {
        const p = pointOnAxis(i, AXES.length, maxValue, maxValue, radius, center)
        return (
          <line
            key={axis.key}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#E4E4F5"
            strokeWidth="1"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={dataPath}
        fill="#7B83C4"
        fillOpacity="0.25"
        stroke="#7B83C4"
        strokeWidth="2"
      />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#7B83C4" />
      ))}

      {/* Labels */}
      {AXES.map((axis, i) => {
        const labelPoint = pointOnAxis(i, AXES.length, maxValue + 3.2, maxValue, radius, center)
        return (
          <text
            key={axis.key}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10.5"
            fontWeight="600"
            fill="#5B5770"
          >
            {axis.label}
          </text>
        )
      })}
    </svg>
  )
}