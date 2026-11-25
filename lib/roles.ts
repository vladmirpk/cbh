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

export type NavItem = { href: string; label: string; icon: string };
export type NavGroup = { id: string; label: string; items: NavItem[] };

type NavDef = NavItem & { roles: string[] };

const NAV: { id: string; label: string; items: NavDef[] }[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { href: "/admin", label: "Overview", icon: "gauge", roles: ["super_admin", "management", "salesperson", "marketing", "operations"] },
      { href: "/admin/notifications", label: "Alerts", icon: "bell", roles: ["super_admin", "management", "salesperson", "marketing", "operations"] },
    ],
  },
  {
    id: "sales",
    label: "Sales desk",
    items: [
      { href: "/admin/leads", label: "Leads", icon: "users", roles: ["super_admin", "management", "salesperson"] },
      { href: "/admin/customers", label: "Customers", icon: "contact", roles: ["super_admin", "management", "salesperson"] },
      { href: "/admin/quotes", label: "Quotations", icon: "file", roles: ["super_admin", "management", "salesperson"] },
      { href: "/admin/orders", label: "Orders", icon: "truck", roles: ["super_admin", "management", "salesperson", "operations"] },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    items: [
      { href: "/admin/products", label: "Products", icon: "package", roles: ["super_admin", "management", "marketing", "operations"] },
      { href: "/admin/categories", label: "Categories", icon: "grid", roles: ["super_admin", "management", "marketing"] },
      { href: "/admin/delivery", label: "Delivery rates", icon: "map", roles: ["super_admin", "management", "operations"] },
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    items: [
      { href: "/admin/promotions", label: "Promotions", icon: "megaphone", roles: ["super_admin", "management", "marketing"] },
      { href: "/admin/projects", label: "Projects", icon: "building", roles: ["super_admin", "management", "marketing"] },
      { href: "/admin/posts", label: "Journal", icon: "pen", roles: ["super_admin", "management", "marketing"] },
      { href: "/admin/faqs", label: "FAQs", icon: "help", roles: ["super_admin", "management", "marketing"] },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/team", label: "Team", icon: "shield", roles: ["super_admin"] },
      { href: "/admin/settings", label: "Settings", icon: "settings", roles: ["super_admin", "management"] },
      { href: "/admin/activity", label: "Audit log", icon: "activity", roles: ["super_admin", "management"] },
    ],
  },
];

export function navGroupsFor(role: string): NavGroup[] {
  return NAV.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items
      .filter((item) => item.roles.includes(role))
      .map(({ href, label, icon }) => ({ href, label, icon })),
  })).filter((group) => group.items.length > 0);
}

/** Flat list kept for any callers that still expect it. */
export function navFor(role: string): { href: string; label: string }[] {
  return navGroupsFor(role).flatMap((group) => group.items.map(({ href, label }) => ({ href, label })));
}

export function quickActionsFor(role: string): { href: string; label: string }[] {
  const actions: ({ href: string; label: string; roles: string[] })[] = [
    { href: "/admin/leads", label: "Open leads", roles: ["super_admin", "management", "salesperson"] },
    { href: "/admin/products/new", label: "Add product", roles: ["super_admin", "management", "marketing", "operations"] },
    { href: "/admin/promotions?id=new", label: "New campaign", roles: ["super_admin", "management", "marketing"] },
    { href: "/admin/orders", label: "Orders", roles: ["super_admin", "management", "salesperson", "operations"] },
    { href: "/quote", label: "Public quote", roles: ["super_admin", "management", "salesperson", "marketing", "operations"] },
  ];
  return actions.filter((item) => item.roles.includes(role)).map(({ href, label }) => ({ href, label }));
}
