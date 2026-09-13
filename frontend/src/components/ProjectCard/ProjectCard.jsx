import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Github, PenLine } from 'lucide-react'
import ProgressRing from '../Progress/ProgressRing'
import { isOlderThan } from '../../utils/date'

const VISIBLE_AGENT_KEYS = ['idea_evaluation', 'scope', 'tech', 'timeline', 'risk']

const STAGE_LABELS = {
  idea_evaluation: 'Idea Evaluation',
  scope: 'Scope Definition',
  tech: 'Tech Recommendation',
  timeline: 'Timeline Planning',
  risk: 'Risk Assessment',
}

const STATUS_STYLES = {
  in_progress: 'bg-amber-100 text-amber-700',
  blueprint_ready: 'bg-sage-100 text-sage-700',
  completed: 'bg-periwinkle-100 text-periwinkle-700',
}

const STATUS_LABELS = {
  in_progress: 'In progress',
  blueprint_ready: 'Blueprint ready',
  completed: 'Completed',
}

function isStalled(project) {
  return isOlderThan(project.last_activity_at, 48) && project.status === 'in_progress'
}

function nextActionText(project) {
  if (project.status === 'blueprint_ready') return 'Blueprint ready — download your report or ask your mentor a question.'
  if (isStalled(project)) return `Pick back up on ${STAGE_LABELS[project.current_stage] || 'your next step'} — it's been a couple of days.`
  return `Currently working through: ${STAGE_LABELS[project.current_stage] || project.current_stage}`
}

export default function ProjectCard({ project, index = 0 }) {
  const completed = (project.agent_runs || []).filter(
    (a) => VISIBLE_AGENT_KEYS.includes(a.agent_key) && a.status === 'completed'
  ).length
  const stalled = isStalled(project)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        to={`/student/projects/${project.id}`}
        className={`group flex items-center justify-between gap-4 rounded-xl2 border bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift ${
          stalled ? 'border-amber-300' : 'border-periwinkle-100'
        }`}
      >
        <div className="flex items-start gap-3">
          <ProgressRing completed={completed} total={5} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-ink-faint">
                {project.source_type === 'github' ? <Github size={14} /> : <PenLine size={14} />}
              </span>
              <h3 className="font-display text-base font-semibold text-ink">{project.title}</h3>
            </div>
            <p className={`mt-1 text-xs ${stalled ? 'font-semibold text-amber-700' : 'text-ink-faint'}`}>
              {stalled ? '⚠ ' : ''}{nextActionText(project)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline-block ${
              STATUS_STYLES[project.status] || 'bg-panel text-ink-faint'
            }`}
          >
            {STATUS_LABELS[project.status] || project.status}
          </span>
          <ArrowUpRight
            size={16}
            className="text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-periwinkle-500"
          />
        </div>
      </Link>
    </motion.div>
  )
}