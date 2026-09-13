import { motion } from 'framer-motion'
import { CheckCircle2, MessageCircle, FolderPlus, Sparkles } from 'lucide-react'
import { timeAgo } from '../../utils/date'

function iconFor(label) {
  if (label.toLowerCase().includes('feedback')) return MessageCircle
  if (label.toLowerCase().includes('created') || label.toLowerCase().includes('imported')) return FolderPlus
  if (label.toLowerCase().includes('completed')) return CheckCircle2
  return Sparkles
}

export default function ActivityFeed({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-6 text-center">
        <p className="text-sm text-ink-faint">Activity will show up here once you get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {events.map((e, i) => {
        const Icon = iconFor(e.label)
        return (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-panel/50"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
              <Icon size={14} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">{e.label}</p>
              {e.project_title && (
                <p className="text-xs text-ink-faint">{e.project_title}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-ink-faint">{timeAgo(e.created_at)}</span>
          </motion.div>
        )
      })}
    </div>
  )
}