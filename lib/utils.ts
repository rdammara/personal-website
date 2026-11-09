export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

// A moment as "Nov 9, 2026, 14:05 UTC"; static pages can't say "5 minutes ago" truthfully
export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(new Date(date));
}

export function excerpt(text: string, maxLength = 160) {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= maxLength) return flat;
  return `${flat.slice(0, flat.lastIndexOf(' ', maxLength))}…`;
}
