import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { markNotificationsRead } from "@/lib/actions/admin";
import { formatDate } from "@/lib/format";
import Link from "next/link";

export default async function NotificationsPage() {
  await requireUser();
  const items = await prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="display text-4xl">Alerts</h1>
        <form action={markNotificationsRead}><button className="text-sm underline">Mark all read</button></form>
      </div>
      <ul className="mt-6 grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="panel p-4 text-sm">
            <p className="font-semibold">{item.title}</p>
            <p className="text-stone">{item.body}</p>
            <p className="mt-1 text-xs text-stone">{formatDate(item.createdAt)} {item.read ? "" : "· unread"}</p>
            {item.href ? <Link href={item.href} className="text-brick">Open</Link> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
