import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import GreetingHeader from '../components/Greeting/GreetingHeader'
import StudentProjectRow from '../components/FacultyTable/StudentProjectRow'
import { getFacultyGreeting, getFacultyOverview } from '../api/faculty'
import { isOlderThan } from '../utils/date'

function isStalled(project) {
  if (project.schedule_status) return project.schedule_status === 'behind'
  return isOlderThan(project.last_activity_at, 120)
}

function StatPill({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-ink',
    warn: 'text-coral-600',
    good: 'text-sage-700',
  }
  return (
    <div className="rounded-xl2 border border-periwinkle-100 bg-white px-5 py-4 shadow-soft">
      <p className={`font-display text-2xl font-semibold ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{label}</p>
    </div>
  )
}

export default function FacultyDashboard() {
  const [greetingData, setGreetingData] = useState(null)
  const [overview, setOverview] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([getFacultyGreeting(), getFacultyOverview()]).then(([g, o]) => {
      setGreetingData(g)
      setOverview(o)
    })
  }, [])

  const visibleStudents = useMemo(() => {
    if (!overview) return []
    const q = search.trim().toLowerCase()
    const filtered = q
      ? overview.students.filter(
          (s) =>
            s.owner_name?.toLowerCase().includes(q) ||
            s.title?.toLowerCase().includes(q)
        )
      : overview.students

    // Priority queue: stalled projects surface first so faculty see who needs
    // attention before who's already on track.
    return [...filtered].sort((a, b) => {
      const aStalled = isStalled(a) ? 0 : 1
      const bStalled = isStalled(b) ? 0 : 1
      if (aStalled !== bStalled) return aStalled - bStalled
      return new Date(b.last_activity_at) - new Date(a.last_activity_at)
    })
  }, [overview, search])

  return (
    <AppShell>
      <GreetingHeader
        greeting={greetingData?.greeting}
        quote={greetingData?.quote}
        loading={!greetingData}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatPill label="Total students" value={overview?.total_students ?? '–'} />
        <StatPill label="Total projects" value={overview?.total_projects ?? '–'} />
        <StatPill label="Active projects" value={overview?.active_projects ?? '–'} tone="good" />
        <StatPill
          label="Need attention"
          value={overview?.stalled_projects ?? '–'}
          tone={overview?.stalled_projects > 0 ? 'warn' : 'default'}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-8 rounded-xl2 border border-periwinkle-100 bg-white shadow-soft"
      >
        <div className="flex items-center justify-between gap-4 border-b border-periwinkle-100 px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">
            Priority queue — needs attention first
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or project…"
              className="w-56 rounded-full border border-periwinkle-200 bg-paper py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-periwinkle-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-3 px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <span>Student</span>
          <span>Project</span>
          <span>Status</span>
          <span>Activity</span>
          <span />
        </div>

        <div className="px-2 pb-2">
          {!overview && (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-xl bg-panel" />
              ))}
            </div>
          )}

          {overview && visibleStudents.length === 0 && (
            <p className="p-6 text-center text-sm text-ink-faint">
              {overview.students.length === 0
                ? "No student projects yet — they'll appear here as students get started."
                : 'No matches for your search.'}
            </p>
          )}

          {visibleStudents.map((p) => (
            <StudentProjectRow key={p.id} project={p} />
          ))}
        </div>
      </motion.div>
    </AppShell>
  )
}