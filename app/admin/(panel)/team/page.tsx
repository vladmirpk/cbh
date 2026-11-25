import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { deactivateUser, saveUser } from "@/lib/actions/admin";
import { labelOf, ROLES } from "@/lib/types";
import { RowActions } from "@/components/admin/RowActions";
import { PreviewSheet } from "@/components/admin/PreviewSheet";
import { ConfirmAction } from "@/components/admin/ConfirmAction";

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const user = await requireUser();
  if (!canManageTeam(user.role)) return <Denied />;
  const { id } = await searchParams;
  const people = await prisma.user.findMany({ orderBy: { name: "asc" } });
  const current = id ? people.find((person) => person.id === id) : null;
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="display text-4xl text-ink">{current ? "Edit account" : "Team"}</h1>
        <div className="mt-4">
          <SmartForm
            action={saveUser}
            submit={current ? "Update account" : "Save account"}
            confirm={{
              title: current ? `Update ${current.name}?` : "Create staff account?",
              message: current
                ? "Role and access changes apply on their next sign-in."
                : "They will be able to sign into the staff desk with this email.",
              confirmLabel: current ? "Update account" : "Create account",
              cancelLabel: "Keep editing",
            }}
          >
            <input type="hidden" name="id" value={current?.id ?? ""} />
            <label><span className="label">Name</span><input className="field" name="name" defaultValue={current?.name} required /></label>
            <label><span className="label">Email</span><input className="field" name="email" type="email" defaultValue={current?.email} required /></label>
            <label><span className="label">Phone</span><input className="field" name="phone" defaultValue={current?.phone ?? ""} /></label>
            <label>
              <span className="label">Role</span>
              <select className="field" name="role" defaultValue={current?.role ?? "salesperson"}>
                {ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}
              </select>
            </label>
            <label><span className="label">Password{current ? " (leave blank to keep)" : ""}</span><input className="field" name="password" type="password" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked={current?.active ?? true} /> Active</label>
          </SmartForm>
        </div>
        {current && current.id !== user.id ? (
          <div className="mt-4">
            <ConfirmAction
              action={deactivateUser}
              fields={{ id: current.id }}
              label="Deactivate account"
              confirm={{
                title: `Deactivate ${current.name}?`,
                message: "They will no longer be able to sign into the staff desk.",
                detail: current.email,
                confirmLabel: "Deactivate",
                cancelLabel: "Keep active",
                tone: "danger",
              }}
            />
          </div>
        ) : null}
        {current ? <p className="mt-3 text-sm"><Link href="/admin/team">New account</Link></p> : null}
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {people.map((person) => (
          <li key={person.id} className="panel flex flex-wrap items-center justify-between gap-3 p-3">
            <div>
              <p className="font-semibold text-ink">{person.name}</p>
              <p className="text-stone">{person.email} · {labelOf(ROLES, person.role)} · {person.active ? "active" : "inactive"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <PreviewSheet
                title={person.name}
                editHref={`/admin/team?id=${person.id}`}
                lines={[
                  { label: "Email", value: person.email },
                  { label: "Phone", value: person.phone || "—" },
                  { label: "Role", value: labelOf(ROLES, person.role) },
                  { label: "Status", value: person.active ? "Active" : "Inactive" },
                ]}
              />
              <RowActions editHref={`/admin/team?id=${person.id}`} />
              {person.id !== user.id && person.active ? (
                <ConfirmAction
                  action={deactivateUser}
                  fields={{ id: person.id }}
                  label="Deactivate"
                  confirm={{
                    title: `Deactivate ${person.name}?`,
                    message: "They will no longer be able to sign into the staff desk.",
                    detail: person.email,
                    confirmLabel: "Deactivate",
                    cancelLabel: "Keep active",
                    tone: "danger",
                  }}
                />
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
