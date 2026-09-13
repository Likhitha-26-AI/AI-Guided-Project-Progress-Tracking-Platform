export function Spinner({ className = '' }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-periwinkle-400 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-periwinkle-400 [animation-delay:150ms]" />
      <span className="h-1.5 w-1.5 animate-pulseSoft rounded-full bg-periwinkle-400 [animation-delay:300ms]" />
    </span>
  )
}
