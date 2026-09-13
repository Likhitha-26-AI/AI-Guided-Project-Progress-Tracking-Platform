import { useEffect, useState } from 'react'
import { Radar, Info } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import RadarChart from '../components/Insights/RadarChart'
import ReadinessGauge from '../components/Insights/ReadinessGauge'
import RiskHeatmap from '../components/Insights/RiskHeatmap'
import { getInsights } from '../api/student'

const AXIS_EXPLANATIONS = [
  { label: 'Feasibility', text: 'How realistic this project is to actually build, given typical student time and resources.' },
  { label: 'Scope Clarity', text: 'How well-defined the features and boundaries of the project are — vague scope is a common cause of scope creep.' },
  { label: 'Tech Readiness', text: 'How well-suited and learnable the recommended tech stack is for this project.' },
  { label: 'Timeline Realism', text: 'Whether the week-by-week plan is achievable in the time you gave, without last-minute crunch.' },
  { label: 'Risk Safety', text: 'How well the major risks are understood and planned for — higher is safer, lower means more unaddressed risk.' },
]

export default function StudentInsights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInsights().then((data) => {
      setInsights(data)
      setLoading(false)
    })
  }, [])

  const scored = insights.filter((p) => p.scores)

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Radar size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Project Insights</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        A readiness score, radar chart, and risk breakdown for each finished blueprint — generated
        by your AI mentor team after reviewing the whole plan.
      </p>

      {!loading && scored.length > 0 && (
        <div className="mt-4 rounded-xl2 border border-periwinkle-100 bg-periwinkle-50/60 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Info size={14} /> How to read this
          </div>
          <p className="mb-2 text-xs text-ink-soft">
            The big number is your overall <strong>readiness score</strong> (0-100) — how ready
            this project is to actually build, all factors combined. The five-pointed shape
            breaks that down: <strong>the bigger the shape, the stronger the project</strong> on
            that dimension. A small dent toward the center on any point means that's the area
            most worth improving.
          </p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {AXIS_EXPLANATIONS.map((a) => (
              <p key={a.label} className="text-xs text-ink-faint">
                <strong className="text-ink-soft">{a.label}:</strong> {a.text}
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            <strong className="text-ink-soft">Top risks:</strong> "severity" is how bad it would
            be if it happened; "likelihood" is how likely it is to happen — both on a 1-3 scale.
            Red means worth addressing soon; green means low concern.
          </p>
        </div>
      )}

      <div className="mt-6 space-y-8">
        {loading && <div className="h-40 animate-pulse rounded-xl2 bg-panel" />}

        {!loading && scored.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
            <p className="text-sm text-ink-soft">
              No scored projects yet — once a project's blueprint finishes, its insights will appear here.
            </p>
          </div>
        )}

        {scored.map((p) => (
          <div key={p.project_id} className="rounded-xl2 border border-periwinkle-100 bg-white p-6 shadow-soft">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">{p.project_title}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr_1fr] md:items-start">
              <div className="flex justify-center">
                <ReadinessGauge score={p.scores.readiness_score} />
              </div>
              <div className="flex justify-center">
                <RadarChart scores={p.scores} />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Top risks</p>
                <RiskHeatmap risks={p.scores.top_risks} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}