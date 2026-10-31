/** WhatsApp number for customer support, international format without "+" (e.g. 62812…). */
export const CS_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_CS_WHATSAPP ?? ""

export function csWhatsAppUrl(invoiceNo?: string) {
  const text = invoiceNo
    ? `Hi KOIN, I need help with order ${invoiceNo}.`
    : "Hi KOIN, I need help with an order."
  return `https://wa.me/${CS_WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
