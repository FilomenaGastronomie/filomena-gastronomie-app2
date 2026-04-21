export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${date}T12:00:00`));
}

export function formatDateTime(dateTime: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(dateTime));
}

export function todayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const adjusted = new Date(now.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 10);
}
