import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import ProjectCard from '../components/ProjectCard/ProjectCard'
import Button from '../components/common/Button'
import { listProjects } from '../api/student'

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listProjects().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">My Projects</h1>
        <Link to="/student/new-project">
          <Button>
            <Plus size={16} /> New project
          </Button>
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl2 bg-panel" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
            <p className="text-sm text-ink-soft">No projects yet — start one to see it here.</p>
          </div>
        )}

        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </AppShell>
  )
}