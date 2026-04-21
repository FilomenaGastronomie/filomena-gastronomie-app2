export function getWeekValue(date: string) {
  const target = new Date(`${date}T12:00:00`);
  const day = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - day + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / 604800000);
  return `${target.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getMonthValue(date: string) {
  const target = new Date(`${date}T12:00:00`);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, "0")}`;
}

export function getCurrentWeekValue() {
  return getWeekValue(new Date().toISOString().slice(0, 10));
}

export function getCurrentMonthValue() {
  return getMonthValue(new Date().toISOString().slice(0, 10));
}
