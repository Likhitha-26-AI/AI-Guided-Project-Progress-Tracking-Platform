import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ListChecks, Check, Sparkles, TrendingUp, Clock } from 'lucide-react'
import AppShell from '../components/Layout/AppShell'
import { getTasks, toggleTask } from '../api/student'

const STATUS_BANNER = {
  behind: { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-700', icon: Clock },
  ahead: { bg: 'bg-sage-100', border: 'border-sage-300', text: 'text-sage-700', icon: TrendingUp },
}

function ProjectTaskGroup({ project, onToggle }) {
  const allDone = project.task_status?.all_done

  return (
    <div className="rounded-xl2 border border-periwinkle-100 bg-white p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">{project.project_title}</h2>
        {allDone && (
          <span className="flex items-center gap-1 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
            <Check size={13} /> Completed
          </span>
        )}
      </div>

      {project.ai_message && (
        (() => {
          const style = STATUS_BANNER[project.task_status?.status]
          if (!style) return null
          const Icon = style.icon
          return (
            <div className={`mb-4 flex items-start gap-2 rounded-xl2 border ${style.border} ${style.bg} p-3`}>
              <Icon size={16} className={`mt-0.5 shrink-0 ${style.text}`} />
              <p className={`text-sm ${style.text}`}>{project.ai_message}</p>
            </div>
          )
        })()
      )}

      <div className="space-y-4">
        {project.weeks.map((week) => {
          const weekDone = week.tasks.every((t) => t.is_done)
          return (
            <div key={week.week_number}>
              <div className="mb-1.5 flex items-center gap-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    weekDone ? 'bg-sage-500 text-white' : 'bg-panel text-ink-faint'
                  }`}
                >
                  {weekDone ? <Check size={11} /> : week.week_number}
                </span>
                <p className="text-sm font-semibold text-ink">
                  Week {week.week_number}{week.goal ? ` — ${week.goal}` : ''}
                </p>
              </div>
              <div className="ml-7 space-y-1">
                {week.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-panel/50"
                  >
                    <input
                      type="checkbox"
                      checked={task.is_done}
                      onChange={() => onToggle(task.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-periwinkle-300 text-periwinkle-500 focus:ring-periwinkle-400"
                    />
                    <span className={`text-sm ${task.is_done ? 'text-ink-faint line-through' : 'text-ink-soft'}`}>
                      {task.task_text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function StudentTasks() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTasks().then((data) => {
      setProjects(data)
      setLoading(false)
    })
  }, [])

  const handleToggle = async (taskId) => {
    // Optimistic update — flip it locally right away, then confirm with the server.
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        weeks: p.weeks.map((w) => ({
          ...w,
          tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, is_done: !t.is_done } : t)),
        })),
      }))
    )
    try {
      await toggleTask(taskId)
    } catch {
      // Revert on failure
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          weeks: p.weeks.map((w) => ({
            ...w,
            tasks: w.tasks.map((t) => (t.id === taskId ? { ...t, is_done: !t.is_done } : t)),
          })),
        }))
      )
    }
  }

  return (
    <AppShell>
      <div className="flex items-center gap-2">
        <ListChecks size={22} className="text-periwinkle-600" />
        <h1 className="font-display text-2xl font-semibold text-ink">Tasks</h1>
      </div>
      <p className="mt-1 text-sm text-ink-faint">
        Every task from every project's timeline, in one place — check them off as you go.
      </p>

      <div className="mt-6 space-y-6">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl2 bg-panel" />
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-10 text-center">
            <Sparkles size={22} className="mx-auto mb-2 text-ink-faint" />
            <p className="text-sm text-ink-soft">
              No task checklists yet — they're generated automatically once a project's
              blueprint finishes.
            </p>
          </div>
        )}

        <AnimatePresence>
          {projects.map((p) => (
            <motion.div
              key={p.project_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectTaskGroup project={p} onToggle={handleToggle} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}