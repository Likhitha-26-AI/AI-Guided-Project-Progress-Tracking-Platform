export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-faint">{hint}</span>}
    </label>
  )
}

const baseInputStyles =
  'w-full rounded-xl border border-periwinkle-200 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-periwinkle-400 focus:outline-none transition-colors'

export function Input(props) {
  return <input className={baseInputStyles} {...props} />
}

export function Textarea(props) {
  return <textarea className={`${baseInputStyles} resize-none`} {...props} />
}

export function Select({ children, ...props }) {
  return (
    <select className={baseInputStyles} {...props}>
      {children}
    </select>
  )
}
