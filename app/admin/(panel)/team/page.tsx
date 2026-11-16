import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canManageTeam } from "@/lib/roles";
import { Denied } from "@/components/ui";
import { SmartForm } from "@/components/SmartForm";
import { saveUser } from "@/lib/actions/admin";
import { labelOf, ROLES } from "@/lib/types";

export default async function TeamPage() {
  const user = await requireUser();
  if (!canManageTeam(user.role)) return <Denied />;
  const people = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="display text-4xl">Team</h1>
        <div className="mt-4">
          <SmartForm action={saveUser} submit="Save account">
            <label><span className="label">Name</span><input className="field" name="name" required /></label>
            <label><span className="label">Email</span><input className="field" name="email" type="email" required /></label>
            <label><span className="label">Phone</span><input className="field" name="phone" /></label>
            <label><span className="label">Role</span><select className="field" name="role">{ROLES.map((role) => <option key={role.id} value={role.id}>{role.label}</option>)}</select></label>
            <label><span className="label">Password</span><input className="field" name="password" type="password" /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" value="yes" defaultChecked /> Active</label>
          </SmartForm>
        </div>
      </div>
      <ul className="grid content-start gap-2 text-sm">
        {people.map((person) => (
          <li key={person.id} className="panel p-3">
            <p className="font-semibold">{person.name}</p>
            <p className="text-stone">{person.email} · {labelOf(ROLES, person.role)} · {person.active ? "active" : "inactive"}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
