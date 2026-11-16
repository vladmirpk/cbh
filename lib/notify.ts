import { prisma } from "./prisma";

export async function notify(title: string, body: string, href?: string) {
  await prisma.notification.create({ data: { title, body, href } });
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  const from = process.env.NOTIFY_FROM;
  if (!key || !to || !from) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: title,
      text: `${body}${href ? `\n\n${process.env.NEXT_PUBLIC_SITE_URL || ""}${href}` : ""}`,
    }),
  }).catch(() => undefined);
}

export async function audit(
  action: string,
  entity: string,
  entityId?: string,
  detail?: string,
  actorEmail?: string | null,
) {
  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId,
      detail,
      actorEmail: actorEmail ?? undefined,
    },
  });
}
