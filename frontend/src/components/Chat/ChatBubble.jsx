import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function ChatBubble({ message }) {
  const isAi = message.sender === 'ai'

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[85%] items-start gap-2 ${isAi ? '' : 'flex-row-reverse'}`}>
        {isAi && (
          <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-periwinkle-500 text-white">
            <Sparkles size={12} />
          </span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isAi
              ? message.is_proactive
                ? 'border border-amber-300 bg-amber-100 text-ink'
                : 'bg-panel text-ink'
              : 'bg-periwinkle-500 text-white'
          }`}
        >
          {message.content}
        </div>
      </div>
    </motion.div>
  )
}
