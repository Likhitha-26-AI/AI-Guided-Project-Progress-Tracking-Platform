import { motion } from 'framer-motion'
import { Check, X, Eye, Loader2 } from 'lucide-react'

const STATUS_STYLES = {
  pending: {
    dot: 'bg-white border-2 border-periwinkle-200',
    label: 'text-ink-faint',
    badge: 'text-ink-faint',
  },
  working: {
    dot: 'bg-periwinkle-500 border-2 border-periwinkle-500 animate-pulseSoft',
    label: 'text-periwinkle-600',
    badge: 'text-periwinkle-600',
  },
  completed: {
    dot: 'bg-sage-500 border-2 border-sage-500',
    label: 'text-ink',
    badge: 'text-sage-700',
  },
  failed: {
    dot: 'bg-coral-500 border-2 border-coral-500',
    label: 'text-ink',
    badge: 'text-coral-700',
  },
}

const STATUS_TEXT = {
  pending: 'Waiting',
  working: 'Working…',
  completed: 'Completed',
  failed: 'Needs attention',
}

export default function AgentNode({ agent, isLast, isSelected, onSelect }) {
  const styles = STATUS_STYLES[agent.status] || STATUS_STYLES.pending
  const hasOutput = agent.status === 'completed' && agent.output_text

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Rail */}
      <div className="flex flex-col items-center">
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.dot} transition-colors duration-500`}>
          {agent.status === 'completed' && <Check size={14} className="text-white" strokeWidth={3} />}
          {agent.status === 'failed' && <X size={14} className="text-white" strokeWidth={3} />}
          {agent.status === 'working' && <Loader2 size={13} className="animate-spin text-white" />}
        </div>
        {!isLast && (
          <div className="relative mt-1 w-px flex-1 bg-periwinkle-100">
            <motion.div
              className="absolute inset-x-0 top-0 w-px origin-top bg-sage-500"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: agent.status === 'completed' ? 1 : 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <div className="flex items-center justify-between gap-3">
          <h3 className={`font-display text-base font-semibold ${styles.label}`}>
            {agent.agent_label}
          </h3>
          <span className={`text-xs font-semibold ${styles.badge}`}>
            {STATUS_TEXT[agent.status] || 'Waiting'}
          </span>
        </div>

        {agent.status === 'working' && (
          <p className="mt-1 text-sm text-ink-faint">Thinking through your project…</p>
        )}

        {hasOutput && (
          <button
            onClick={() => onSelect(agent)}
            className={`mt-2 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              isSelected
                ? 'bg-periwinkle-500 text-white'
                : 'bg-periwinkle-100 text-periwinkle-700 hover:bg-periwinkle-200'
            }`}
          >
            <Eye size={13} /> {isSelected ? 'Viewing response' : 'View response'}
          </button>
        )}

        {agent.status === 'failed' && agent.output_text && (
          <p className="mt-2 rounded-xl2 border border-coral-100 bg-coral-100/50 p-3 text-sm text-coral-700">
            {agent.output_text}
          </p>
        )}
      </div>
    </div>
  )
}