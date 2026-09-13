import { motion } from 'framer-motion'
import { Radar, MessageSquareText, ListChecks } from 'lucide-react'

const QUOTES = [
  { quote: "Every expert was once a beginner. Keep building.", author: 'Unknown' },
  { quote: "The best time to start was yesterday. The next best time is now.", author: 'Unknown' },
  { quote: "A good plan today beats a perfect plan next week.", author: 'Unknown' },
  { quote: "Progress, not perfection.", author: 'Unknown' },
  { quote: "Small steps every day add up to big things.", author: 'Unknown' },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: 'Zig Ziglar' },
  { quote: "Consistency beats intensity.", author: 'Unknown' },
]

function todaysQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000)
  return QUOTES[dayIndex % QUOTES.length]
}

const FEATURES = [
  { icon: Radar, text: '5 AI mentors turn your idea into a full project blueprint' },
  { icon: ListChecks, text: 'Track weekly tasks and stay on schedule automatically' },
  { icon: MessageSquareText, text: 'Get real feedback from your faculty mentor, in one place' },
]

export default function WelcomePanel() {
  const { quote, author } = todaysQuote()

  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-periwinkle-500 p-10 text-white lg:flex">
      {/* Decorative abstract shapes — no external images, pure CSS/SVG */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sage-300 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <h1 className="font-display text-3xl font-semibold leading-snug">
          Plan smarter.<br />Build with confidence.
        </h1>
        <p className="mt-3 max-w-sm text-sm text-periwinkle-50">
          An AI-guided platform that turns your project idea into a real blueprint —
          and keeps you and your mentor on the same page the whole way through.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative space-y-4"
      >
        {FEATURES.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
              <f.icon size={16} />
            </span>
            <p className="text-sm text-periwinkle-50">{f.text}</p>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative border-t border-white/20 pt-5"
      >
        <p className="font-display text-base italic text-white">"{quote}"</p>
        <p className="mt-1 text-xs text-periwinkle-100">— {author}</p>
      </motion.div>
    </div>
  )
}