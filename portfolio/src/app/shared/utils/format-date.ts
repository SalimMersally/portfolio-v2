/** Parse a bare `YYYY-MM-DD` string as local time (avoids the UTC shift of `new Date('YYYY-MM-DD')`). */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
}

export function formatDate(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDateFull(dateStr: string): string {
  return parseDate(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.substring(0, Math.min(3, name.length)).toUpperCase();
}

export function groupBy<T>(arr: T[], key: (item: T) => string): Map<string, T[]> {
  return arr.reduce((map, item) => {
    const k = key(item);
    const existing = map.get(k) ?? [];
    map.set(k, [...existing, item]);
    return map;
  }, new Map<string, T[]>());
}
