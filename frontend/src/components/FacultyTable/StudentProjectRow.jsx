import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { timeAgo, isOlderThan } from '../../utils/date'

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

const SCHEDULE_STYLES = {
  behind: 'font-semibold text-coral-600',
  ahead: 'font-semibold text-sage-700',
  on_track: 'text-ink-faint',
  completed: 'text-ink-faint',
}

function scheduleLabel(project) {
  const { schedule_status, weeks_behind } = project
  if (schedule_status === 'behind') return `⚠ Behind by ${weeks_behind} week${weeks_behind === 1 ? '' : 's'}`
  if (schedule_status === 'ahead') return `✓ Ahead by ${Math.abs(weeks_behind)} week${Math.abs(weeks_behind) === 1 ? '' : 's'}`
  if (schedule_status === 'on_track') return 'On track'
  if (schedule_status === 'completed') return 'All tasks done'
  // No task checklist yet — fall back to activity-based signal.
  const stalled = isOlderThan(project.last_activity_at, 120)
  return stalled ? `⚠ Inactive ${timeAgo(project.last_activity_at)}` : `Active ${timeAgo(project.last_activity_at)}`
}

export default function StudentProjectRow({ project }) {
  const isFlagged = project.schedule_status
    ? project.schedule_status === 'behind'
    : isOlderThan(project.last_activity_at, 120)

  return (
    <Link
      to={`/faculty/projects/${project.id}`}
      className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] items-center gap-3 rounded-xl border border-transparent px-4 py-3.5 text-sm transition-colors hover:border-periwinkle-100 hover:bg-panel/50"
    >
      <div>
        <p className="font-semibold text-ink">{project.owner_name}</p>
        <p className="text-xs text-ink-faint">{project.owner_email}</p>
      </div>
      <p className="truncate text-ink-soft">{project.title}</p>
      <span
        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
          STATUS_STYLES[project.status] || 'bg-panel text-ink-faint'
        }`}
      >
        {STATUS_LABELS[project.status] || project.status}
      </span>
      <span className={`text-xs ${isFlagged ? 'font-semibold text-coral-600' : SCHEDULE_STYLES[project.schedule_status] || 'text-ink-faint'}`}>
        {scheduleLabel(project)}
      </span>
      <ArrowUpRight size={15} className="justify-self-end text-ink-faint" />
    </Link>
  )
}