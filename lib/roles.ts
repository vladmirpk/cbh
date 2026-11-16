export function canManageProducts(role: string) {
  return ["super_admin", "management", "marketing", "operations"].includes(role);
}

export function canManageLeads(role: string) {
  return ["super_admin", "management", "salesperson"].includes(role);
}

export function canSeeAllLeads(role: string) {
  return ["super_admin", "management"].includes(role);
}

export function canManageDelivery(role: string) {
  return ["super_admin", "management", "operations"].includes(role);
}

export function canManageContent(role: string) {
  return ["super_admin", "management", "marketing"].includes(role);
}

export function canManageOrders(role: string) {
  return ["super_admin", "management", "salesperson", "operations"].includes(role);
}

export function canManageTeam(role: string) {
  return role === "super_admin";
}

export function canSeeFinance(role: string) {
  return ["super_admin", "management", "salesperson"].includes(role);
}

export type NavItem = { href: string; label: string };

export function navFor(role: string): NavItem[] {
  const items: (NavItem & { roles: string[] })[] = [
    { href: "/admin", label: "Overview", roles: ["super_admin", "management", "salesperson", "marketing", "operations"] },
    { href: "/admin/leads", label: "Leads", roles: ["super_admin", "management", "salesperson"] },
    { href: "/admin/customers", label: "Customers", roles: ["super_admin", "management", "salesperson"] },
    { href: "/admin/quotes", label: "Quotations", roles: ["super_admin", "management", "salesperson"] },
    { href: "/admin/orders", label: "Orders", roles: ["super_admin", "management", "salesperson", "operations"] },
    { href: "/admin/products", label: "Catalogue", roles: ["super_admin", "management", "marketing", "operations"] },
    { href: "/admin/categories", label: "Categories", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/promotions", label: "Promotions", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/projects", label: "Projects", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/posts", label: "Journal", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/faqs", label: "FAQs", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/delivery", label: "Delivery rates", roles: ["super_admin", "management", "operations"] },
    { href: "/admin/team", label: "Team", roles: ["super_admin"] },
    { href: "/admin/settings", label: "Settings", roles: ["super_admin", "management"] },
    { href: "/admin/activity", label: "Audit log", roles: ["super_admin", "management"] },
  ];
  return items.filter((item) => item.roles.includes(role)).map(({ href, label }) => ({ href, label }));
}
