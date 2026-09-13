export default function ProgressRing({ completed, total, size = 44 }) {
  const radius = (size - 6) / 2
  const circumference = 2 * Math.PI * radius
  const pct = total > 0 ? completed / total : 0
  const offset = circumference * (1 - pct)

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E4E4F5"
          strokeWidth="4"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={pct === 1 ? '#7FBF9E' : '#7B83C4'}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink-soft">
        {completed}/{total}
      </span>
    </div>
  )
}