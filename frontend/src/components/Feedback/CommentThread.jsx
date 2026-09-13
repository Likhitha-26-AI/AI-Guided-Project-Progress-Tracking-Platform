import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

const AGENT_LABELS = {
  idea_evaluation: 'Idea Evaluation',
  scope: 'Scope Definition',
  tech: 'Tech Recommendation',
  timeline: 'Timeline Planning',
  risk: 'Risk Assessment',
}

export default function CommentThread({ comments = [], emptyText = 'No feedback yet.' }) {
  if (comments.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 p-8 text-center">
        <MessageSquare size={22} className="mx-auto mb-2 text-ink-faint" />
        <p className="text-sm text-ink-faint">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
          className="rounded-xl2 border border-periwinkle-100 bg-white p-4 shadow-soft"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-periwinkle-500 text-xs font-bold text-white">
                {c.author_name?.[0]?.toUpperCase() || 'M'}
              </span>
              <span className="text-sm font-semibold text-ink">{c.author_name || 'Mentor'}</span>
              {c.agent_key && (
                <span className="rounded-full bg-panel px-2 py-0.5 text-[11px] font-medium text-ink-faint">
                  on {AGENT_LABELS[c.agent_key] || c.agent_key}
                </span>
              )}
            </div>
            <span className="text-xs text-ink-faint">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{c.content}</p>
        </motion.div>
      ))}
    </div>
  )
}