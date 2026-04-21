export function normalizePhoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, "");
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizePhoneForWhatsApp(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
