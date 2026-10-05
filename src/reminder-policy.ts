function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function shouldRemind(
  now: Date,
  lastRemindedDate?: string
): boolean {
  const hour = now.getHours();

  if (hour >= 6) {
    return false;
  }

  const today = localDateKey(now);

  if (lastRemindedDate === today) {
    return false;
  }

  return true;
}
