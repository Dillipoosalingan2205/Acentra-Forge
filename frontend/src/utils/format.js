/**
 * Small formatting helpers. Kept dependency-free for hackathon speed.
 */

const byteUnits = ['B', 'KB', 'MB', 'GB']

/** "1.4 MB" */
export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 B'
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), byteUnits.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${byteUnits[i]}`
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/** "Oct 8, 2026" */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return dateFormatter.format(date)
}
