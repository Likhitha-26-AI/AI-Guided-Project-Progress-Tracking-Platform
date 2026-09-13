import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import AgentMarkdown from '../common/AgentMarkdown'

export default function AgentResponsePanel({ selectedAgent }) {
  return (
    <div className="flex h-full flex-col rounded-xl2 border border-periwinkle-100 bg-white shadow-soft">
      <div className="border-b border-periwinkle-100 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          {selectedAgent ? selectedAgent.agent_label : 'Agent Response'}
        </h2>
        <p className="text-xs text-ink-faint">
          {selectedAgent ? 'Full response from your AI mentor' : 'Click "View response" on any completed agent'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          {selectedAgent ? (
            <motion.div
              key={selectedAgent.agent_key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <AgentMarkdown content={selectedAgent.output_text || ''} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full flex-col items-center justify-center py-16 text-center"
            >
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-500">
                <FileText size={22} />
              </span>
              <p className="max-w-[220px] text-sm text-ink-faint">
                Select any completed agent on the left to read its full response here.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}