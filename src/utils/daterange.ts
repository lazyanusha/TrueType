export function getDateRange(range: string) {
  const now = new Date();
  switch (range) {
    case "week":
      return [new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now];
    case "month":
      return [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now];
    case "year":
      return [new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), now];
    case "all":
    default:
      return [new Date("1970-01-01"), now];
  }
}

export function dateInRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);"combined_input.txt"

  return d >= start && d <= end;
}

export function formatDate(date: Date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
