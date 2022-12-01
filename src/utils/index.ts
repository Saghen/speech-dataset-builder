export const formatNumberDuration = (duration: number) => {
  const parts = []
  if (duration > 60 * 60) parts.push(Math.floor(duration / 60 ** 2))
  parts.push(Math.floor((duration % 60 ** 2) / 60))
  parts.push(duration % 60)
  return [parts[0], ...parts.slice(1).map(part => String(part.toFixed(0)).padStart(2, '0'))].join(':')
}
