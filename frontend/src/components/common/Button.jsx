export default function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-periwinkle-500 text-white hover:bg-periwinkle-600 shadow-lift hover:-translate-y-0.5',
    secondary:
      'bg-white text-ink border border-periwinkle-200 hover:border-periwinkle-400 hover:-translate-y-0.5',
    ghost: 'text-ink-soft hover:text-ink hover:bg-panel',
    subtle: 'bg-panel text-ink-soft hover:bg-periwinkle-100',
  }

  return (
    <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
