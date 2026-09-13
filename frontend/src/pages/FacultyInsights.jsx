import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Radar } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import RadarChart from '../components/Insights/RadarChart'
import ReadinessGauge from '../components/Insights/ReadinessGauge'
import { getCohortInsights } from '../api/faculty'

export default function FacultyInsights() {
  const [data, setData] = useState(null)

  useEffect(() => {
    getCohortInsights().then(setData)
  }, [])

  if (!data) {
    return (
      <AppShell>
        <div className="h-40 animate-pulse rounded-xl2 bg-panel" />
      </AppShell>
    )
  }

  if (data.scored_project_count === 0) {
    return (
      <AppShell>
        <div className="flex items-center gap-2">
          <Radar size={22} className="text-periwinkle-600" />
          <h1 className="font-display text-2xl font-semibold text-ink">Cohort Insights</h1>
        </div>
        <div className="mt-6 rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
          <p className="text-sm text-ink-soft">
            No scored projects yet across your students — insights will appear here once blueprints complete.
          </p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <Radar size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Cohort Insights</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        Averaged across {data.scored_project_count} scored project{data.scored_project_count === 1 ? '' : 's'}.
      </p>

      <div className="mt-6 rounded-xl2 border border-periwinkle-100 bg-white p-6 shadow-soft">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex justify-center">
            <ReadinessGauge score={data.cohort_readiness_score} size={160} />
          </div>
          <div className="flex justify-center">
            <RadarChart scores={data.cohort_averages} size={300} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl2 border border-periwinkle-100 bg-white shadow-soft">
        <div className="border-b border-periwinkle-100 px-5 py-4">
          <h2 className="font-display text-base font-semibold text-ink">Lowest-scoring projects</h2>
        </div>
        <div className="divide-y divide-periwinkle-50">
          {data.projects.slice(0, 8).map((p) => (
            <Link
              key={p.project_id}
              to={`/faculty/projects/${p.project_id}`}
              className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-panel/50"
            >
              <span className="text-ink-soft">{p.project_title}</span>
              <span className="font-semibold text-ink">{p.readiness_score}/100</span>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}