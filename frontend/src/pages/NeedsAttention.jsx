import { useEffect, useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import StudentProjectRow from '../components/FacultyTable/StudentProjectRow'
import { getFacultyOverview } from '../api/faculty'
import { isOlderThan } from '../utils/date'

function isStalled(project) {
  if (project.schedule_status) return project.schedule_status === 'behind'
  return isOlderThan(project.last_activity_at, 120)
}

export default function NeedsAttention() {
  const [overview, setOverview] = useState(null)

  useEffect(() => {
    getFacultyOverview().then(setOverview)
  }, [])

  const stalled = useMemo(() => {
    if (!overview) return []
    return overview.students.filter(isStalled)
  }, [overview])

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <AlertTriangle size={22} className="text-amber-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Needs Attention</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        Students with no project activity in the last 5+ days.
      </p>

      <div className="mt-6 rounded-xl2 border border-periwinkle-100 bg-white shadow-soft">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <span>Student</span>
          <span>Project</span>
          <span>Status</span>
          <span>Activity</span>
          <span />
        </div>

        <div className="px-2 pb-2 pt-2">
          {!overview && (
            <div className="space-y-2 p-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-panel" />
              ))}
            </div>
          )}

          {overview && stalled.length === 0 && (
            <p className="p-8 text-center text-sm text-ink-faint">
              Nobody's stalled right now — everyone's actively working. 🎉
            </p>
          )}

          {stalled.map((p) => (
            <StudentProjectRow key={p.id} project={p} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}