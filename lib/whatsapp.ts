/**
 * WhatsApp Business Cloud API adapter.
 * Sends a text message when WHATSAPP_TOKEN + WHATSAPP_PHONE_ID are set; otherwise no-ops.
 */
export async function sendWhatsAppMessage(toPhone: string, body: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return { sent: false as const, reason: "not_configured" as const };
  const digits = toPhone.replace(/\D/g, "");
  if (digits.length < 7) return { sent: false as const, reason: "bad_phone" as const };
  const res = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: digits,
      type: "text",
      text: { body },
    }),
  }).catch(() => null);
  if (!res?.ok) return { sent: false as const, reason: "api_error" as const };
  return { sent: true as const };
}
