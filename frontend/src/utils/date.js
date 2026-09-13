export function parseServerDate(dateStr) {
  if (!dateStr) return new Date(NaN)
  const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(dateStr)
  return new Date(hasTimezone ? dateStr : `${dateStr}Z`)
}

export function timeAgo(dateStr) {
  const diffMs = Date.now() - parseServerDate(dateStr).getTime()
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function isOlderThan(dateStr, hoursAgo) {
  return parseServerDate(dateStr) < new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
}