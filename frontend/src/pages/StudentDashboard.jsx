import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import GreetingHeader from '../components/Greeting/GreetingHeader'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import ActivityFeed from '../components/Home/ActivityFeed'
import Button from '../components/common/Button'
import { getGreeting, listProjects, getActivity } from '../api/student'
import { isOlderThan } from '../utils/date'

function isStalled(project) {
  return isOlderThan(project.last_activity_at, 48) && project.status === 'in_progress'
}

function StatCard({ label, value, tone = 'default' }) {
  const tones = {
    default: 'text-ink',
    warn: 'text-amber-700',
    good: 'text-sage-700',
  }
  return (
    <div className="rounded-xl2 border border-periwinkle-100 bg-white px-5 py-4 shadow-soft">
      <p className={`font-display text-2xl font-semibold ${tones[tone]}`}>{value}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{label}</p>
    </div>
  )
}

export default function StudentDashboard() {
  const [greetingData, setGreetingData] = useState(null)
  const [projects, setProjects] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGreeting(), listProjects(), getActivity()]).then(([g, p, a]) => {
      setGreetingData(g)
      setProjects(p)
      setActivity(a)
      setLoading(false)
    })
  }, [])

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const aStalled = isStalled(a) ? 0 : 1
      const bStalled = isStalled(b) ? 0 : 1
      if (aStalled !== bStalled) return aStalled - bStalled
      return new Date(b.last_activity_at) - new Date(a.last_activity_at)
    })
  }, [projects])

  const stats = useMemo(() => {
    const total = projects.length
    const ready = projects.filter((p) => p.status === 'blueprint_ready' || p.status === 'completed').length
    const needsAttention = projects.filter(isStalled).length
    return { total, ready, needsAttention }
  }, [projects])

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <GreetingHeader
          greeting={greetingData?.greeting}
          quote={greetingData?.quote}
          loading={!greetingData}
        />
        <Link to="/student/new-project">
          <Button>
            <Plus size={16} /> New project
          </Button>
        </Link>
      </div>

      {!loading && projects.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <StatCard label="Total projects" value={stats.total} />
          <StatCard label="Blueprints ready" value={stats.ready} tone="good" />
          <StatCard
            label="Needs your attention"
            value={stats.needsAttention}
            tone={stats.needsAttention > 0 ? 'warn' : 'default'}
          />
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Your workspace</h2>

          {loading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl2 bg-panel" />
              ))}
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
              <p className="text-sm text-ink-soft">
                You haven't started a project yet. Bring an idea — your AI mentor team will take it
                from there.
              </p>
              <Link to="/student/new-project" className="mt-4 inline-block">
                <Button>
                  <Plus size={16} /> Start your first project
                </Button>
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {sortedProjects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink">Recent activity</h2>
          {loading ? (
            <div className="h-40 animate-pulse rounded-xl2 bg-panel" />
          ) : (
            <div className="rounded-xl2 border border-periwinkle-100 bg-white p-3 shadow-soft">
              <ActivityFeed events={activity} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}