export function isSameDay(date: Date, compare: Date = new Date()): boolean {
  return (
    date.getDate() === compare.getDate() &&
    date.getMonth() === compare.getMonth() &&
    date.getFullYear() === compare.getFullYear()
  );
}

export function isSameMonth(date: Date, compare: Date = new Date()): boolean {
  return (
    date.getMonth() === compare.getMonth() &&
    date.getFullYear() === compare.getFullYear()
  );
}

export function getLastNDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export function isWithinLastNDays(date: Date, n: number): boolean {
  return date >= getLastNDays(n);
}
