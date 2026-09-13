import { motion } from 'framer-motion'

export default function GreetingHeader({ greeting, quote, loading }) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-9 w-64 rounded-lg bg-panel" />
        <div className="mt-3 h-4 w-80 rounded bg-panel" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {greeting} <span className="text-periwinkle-500">.</span>
      </h1>
      {quote && (
        <p className="mt-2 max-w-xl font-display text-base italic text-ink-soft">
          "{quote.quote}"
        </p>
      )}
    </motion.div>
  )
}
