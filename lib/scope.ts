import { canSeeAllLeads } from "./roles";

/** Prisma where-clause for leads visible to this staff user. */
export function leadScope(user: { id: string; role: string }) {
  if (canSeeAllLeads(user.role)) return {};
  return { OR: [{ assignedToId: user.id }, { assignedToId: null }] };
}

/** Narrow quotes/orders to leads the salesperson owns (not unassigned). */
export function ownedLeadScope(user: { id: string; role: string }) {
  if (canSeeAllLeads(user.role)) return {};
  return { assignedToId: user.id };
}

export function quoteScope(user: { id: string; role: string }) {
  if (canSeeAllLeads(user.role)) return {};
  return { lead: { assignedToId: user.id } };
}

export function orderScope(user: { id: string; role: string }) {
  if (canSeeAllLeads(user.role) || user.role === "operations") return {};
  return { lead: { assignedToId: user.id } };
}
