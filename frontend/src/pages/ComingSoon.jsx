import { motion } from 'framer-motion'
import AppShell from '../components/Layout/AppShell'

export default function ComingSoon({ icon: Icon, title, description }) {
  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center rounded-xl2 border border-dashed border-periwinkle-200 bg-white/60 px-8 py-20 text-center"
      >
        <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-periwinkle-100 text-periwinkle-600">
          <Icon size={26} />
        </span>
        <h1 className="font-display text-xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-faint">{description}</p>
        <span className="mt-4 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          Coming soon
        </span>
      </motion.div>
    </AppShell>
  )
}