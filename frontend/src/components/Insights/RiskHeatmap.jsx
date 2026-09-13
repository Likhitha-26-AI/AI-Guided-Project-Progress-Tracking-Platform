const LEVEL_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' }

const CELL_COLORS = {
  '1-1': 'bg-sage-100 text-sage-700',
  '1-2': 'bg-sage-100 text-sage-700',
  '2-1': 'bg-sage-100 text-sage-700',
  '2-2': 'bg-amber-100 text-amber-700',
  '1-3': 'bg-amber-100 text-amber-700',
  '3-1': 'bg-amber-100 text-amber-700',
  '2-3': 'bg-coral-100 text-coral-700',
  '3-2': 'bg-coral-100 text-coral-700',
  '3-3': 'bg-coral-100 text-coral-700',
}

export default function RiskHeatmap({ risks = [] }) {
  if (risks.length === 0) {
    return <p className="text-sm text-ink-faint">No specific risks flagged.</p>
  }

  return (
    <div className="space-y-2">
      {risks.map((risk, i) => {
        const key = `${risk.severity}-${risk.likelihood}`
        const colorClass = CELL_COLORS[key] || 'bg-panel text-ink-faint'
        return (
          <div key={i} className="rounded-xl border border-periwinkle-100 bg-white px-4 py-2.5">
            <p className="text-sm text-ink-soft">{risk.name}</p>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
              {LEVEL_LABELS[risk.severity] || risk.severity} impact if it happens ·{' '}
              {LEVEL_LABELS[risk.likelihood] || risk.likelihood} chance of happening
            </span>
          </div>
        )
      })}
    </div>
  )
}