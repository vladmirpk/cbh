"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { requireUser } from "../auth";
import { audit } from "../notify";
import {
  canManageContent,
  canManageDelivery,
  canManageLeads,
  canManageOrders,
  canManageProducts,
  canManageTeam,
  canSeeAllLeads,
} from "../roles";
import { LEAD_STATUSES, ORDER_STATUSES, PRODUCT_STATUSES, ROLES, type FormState, num, slugify, str } from "../types";

function ok(path: string): never {
  revalidatePath(path);
  revalidatePath("/");
  redirect(path);
}

export async function saveProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return { error: "Your role cannot edit products." };
  const id = str(formData, "id");
  const name = str(formData, "name");
  const sku = str(formData, "sku").toUpperCase();
  const categoryId = str(formData, "categoryId");
  const description = str(formData, "description");
  const unit = str(formData, "unit");
  const price = num(formData, "price");
  const promoRaw = str(formData, "promoPrice");
  const moq = num(formData, "moq");
  const weightKg = num(formData, "weightKg");
  const stockStatus = str(formData, "stockStatus");
  if (name.length < 2 || sku.length < 2 || description.length < 8 || !unit) {
    return { error: "Name, SKU, unit and description are required." };
  }
  if (!Number.isFinite(price) || price < 0 || !Number.isFinite(moq) || moq < 1 || !Number.isFinite(weightKg) || weightKg <= 0) {
    return { error: "Check the price, minimum order and weight." };
  }
  if (!PRODUCT_STATUSES.some((item) => item.id === stockStatus)) return { error: "Choose a product status." };
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Choose a category." };
  const specs = str(formData, "specsText")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: label.trim(), value: rest.join("|").trim() };
    })
    .filter((spec) => spec.label && spec.value);
  const images = str(formData, "imagesText")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("http") || line.startsWith("/"));
  const data = {
    name,
    sku,
    categoryId,
    description,
    unit,
    price,
    promoPrice: promoRaw ? num(formData, "promoPrice") : null,
    moq: Math.round(moq),
    weightKg,
    stockStatus,
    stockQty: str(formData, "stockQty") ? Math.round(num(formData, "stockQty")) : null,
    deliveryNotes: str(formData, "deliveryNotes") || null,
    tags: str(formData, "tags"),
    images: JSON.stringify(images),
    specs: JSON.stringify(specs),
    relatedSlugs: str(formData, "relatedSlugs"),
    warranty: str(formData, "warranty") || null,
    datasheetUrl: str(formData, "datasheetUrl") || null,
    installRequired: formData.get("installRequired") === "yes",
    launchDate: str(formData, "launchDate") || null,
    featured: formData.get("featured") === "yes",
    seoTitle: str(formData, "seoTitle") || null,
    seoDescription: str(formData, "seoDescription") || null,
    active: formData.get("active") === "yes",
  };
  const skuOwner = await prisma.product.findUnique({ where: { sku } });
  if (skuOwner && skuOwner.id !== id) return { error: "That SKU is already in the catalogue." };
  if (id) {
    await prisma.product.update({ where: { id }, data });
    await audit("update", "product", id, name, user.email);
  } else {
    let slug = slugify(name) || slugify(sku);
    if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${sku.toLowerCase()}`;
    await prisma.product.create({ data: { ...data, slug } });
    await audit("create", "product", slug, name, user.email);
  }
  revalidatePath("/products");
  ok("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return;
  const id = str(formData, "id");
  await prisma.product.delete({ where: { id } });
  await audit("delete", "product", id, undefined, user.email);
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function updateListingPrice(formData: FormData) {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return;
  const id = str(formData, "id");
  const price = num(formData, "price");
  const promoRaw = str(formData, "promoPrice");
  if (!id || !Number.isFinite(price) || price < 0) return;
  const promoPrice = promoRaw ? num(formData, "promoPrice") : null;
  if (promoPrice != null && (!Number.isFinite(promoPrice) || promoPrice < 0)) return;
  const product = await prisma.product.update({
    where: { id },
    data: { price, promoPrice },
  });
  await audit("price", "product", id, `${product.sku} ${price}`, user.email);
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/products");
}

export async function setListingVisible(formData: FormData) {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return;
  const id = str(formData, "id");
  const active = formData.get("active") === "yes";
  const product = await prisma.product.update({ where: { id }, data: { active } });
  await audit(active ? "show" : "hide", "product", id, product.name, user.email);
  revalidatePath("/products");
  revalidatePath(`/products/${product.slug}`);
  revalidatePath("/admin/products");
}

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const user = await requireUser();
  if (!canManageProducts(user.role)) return { error: "Your role cannot add photos." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo." };
  if (file.size > 4 * 1024 * 1024) return { error: "Photos must be under 4 MB." };
  const types: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const ext = types[file.type];
  if (!ext) return { error: "Use a JPG, PNG, or WebP photo." };
  const { randomBytes } = await import("crypto");
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${name}` };
}

export async function saveCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageContent(user.role)) return { error: "Your role cannot edit categories." };
  const name = str(formData, "name");
  const description = str(formData, "description");
  if (name.length < 2) return { error: "Category name is required." };
  const id = str(formData, "id");
  const base = {
    name,
    description,
    image: str(formData, "image") || null,
    sortOrder: Number.isFinite(num(formData, "sortOrder")) ? num(formData, "sortOrder") : 0,
    active: formData.get("active") === "yes",
  };
  if (id) {
    await prisma.category.update({ where: { id }, data: base });
  } else {
    let slug = slugify(name);
    if (await prisma.category.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    await prisma.category.create({ data: { ...base, slug } });
  }
  await audit("save", "category", id || name, name, user.email);
  ok("/admin/categories");
}

export async function updateLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return { error: "Your role cannot update leads." };
  const id = str(formData, "id");
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return { error: "Lead not found." };
  if (!canSeeAllLeads(user.role) && lead.assignedToId && lead.assignedToId !== user.id) {
    return { error: "This lead is assigned to someone else." };
  }
  const status = str(formData, "status");
  if (!LEAD_STATUSES.some((item) => item.id === status)) return { error: "Choose a status." };
  const data: {
    status: string;
    assignedToId?: string | null;
    followUpDate?: string | null;
    quoteValue?: number | null;
  } = { status };
  if (formData.has("assignedToId")) data.assignedToId = str(formData, "assignedToId") || null;
  if (formData.has("followUpDate")) data.followUpDate = str(formData, "followUpDate") || null;
  if (formData.has("quoteValue")) data.quoteValue = str(formData, "quoteValue") ? num(formData, "quoteValue") : lead.quoteValue;
  await prisma.lead.update({ where: { id }, data });
  await audit("update", "lead", id, status, user.email);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/leads");
  return { success: "Lead updated." };
}

export async function addNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return { error: "Your role cannot add notes." };
  const leadId = str(formData, "leadId");
  const body = str(formData, "body");
  if (body.length < 2) return { error: "Write a note first." };
  await prisma.leadNote.create({
    data: { leadId, body, authorId: user.id, authorName: user.name },
  });
  revalidatePath(`/admin/leads/${leadId}`);
  return { success: "Note added." };
}

export async function claimLead(formData: FormData) {
  const user = await requireUser();
  if (!canManageLeads(user.role)) return;
  const id = str(formData, "id");
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead || (lead.assignedToId && lead.assignedToId !== user.id && !canSeeAllLeads(user.role))) return;
  await prisma.lead.update({ where: { id }, data: { assignedToId: user.id, status: lead.status === "new" ? "contacted" : lead.status } });
  await audit("claim", "lead", id, user.name, user.email);
  revalidatePath("/admin/leads");
  redirect(`/admin/leads/${id}`);
}

export async function updateOrder(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageOrders(user.role)) return { error: "Your role cannot update orders." };
  const id = str(formData, "id");
  const status = str(formData, "status");
  if (!ORDER_STATUSES.some((item) => item.id === status)) return { error: "Choose a status." };
  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus: str(formData, "paymentStatus") || "unpaid",
      vehicle: str(formData, "vehicle") || null,
      driver: str(formData, "driver") || null,
      deliveryDate: str(formData, "deliveryDate") || null,
      notes: str(formData, "notes") || null,
    },
  });
  if (order.leadId && ["confirmed", "loading", "dispatched", "in_transit", "delivered"].includes(status)) {
    await prisma.lead.update({ where: { id: order.leadId }, data: { status: "won" } });
  }
  await audit("update", "order", id, status, user.email);
  revalidatePath("/admin/orders");
  return { success: "Order updated." };
}

export async function savePromotion(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageContent(user.role)) return { error: "Your role cannot edit promotions." };
  const title = str(formData, "title");
  const headline = str(formData, "headline");
  const description = str(formData, "description");
  if (title.length < 2 || headline.length < 2) return { error: "Title and headline are required." };
  const id = str(formData, "id");
  const data = {
    title,
    headline,
    description,
    image: str(formData, "image") || null,
    priceLabel: str(formData, "priceLabel") || null,
    discount: str(formData, "discount") || null,
    cta: str(formData, "cta") || "quote",
    ctaHref: str(formData, "ctaHref") || "/quote",
    targetArea: str(formData, "targetArea") || null,
    audience: str(formData, "audience") || null,
    expiresAt: str(formData, "expiresAt") || null,
    active: formData.get("active") === "yes",
  };
  if (id) await prisma.promotion.update({ where: { id }, data });
  else {
    let slug = slugify(title);
    if (await prisma.promotion.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    await prisma.promotion.create({ data: { ...data, slug } });
  }
  await audit("save", "promotion", id || title, title, user.email);
  ok("/admin/promotions");
}

export async function saveProject(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageContent(user.role)) return { error: "Your role cannot edit projects." };
  const name = str(formData, "name");
  const location = str(formData, "location");
  const description = str(formData, "description");
  if (name.length < 2 || location.length < 2) return { error: "Project name and location are required." };
  const photos = str(formData, "photos")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("http") || line.startsWith("/"));
  const id = str(formData, "id");
  const data = {
    name,
    location,
    contractor: str(formData, "contractor") || null,
    products: str(formData, "products"),
    quantity: str(formData, "quantity") || null,
    description,
    photos: JSON.stringify(photos),
    status: str(formData, "status") || "completed",
    featured: formData.get("featured") === "yes",
  };
  if (id) await prisma.project.update({ where: { id }, data });
  else {
    let slug = slugify(name);
    if (await prisma.project.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    await prisma.project.create({ data: { ...data, slug } });
  }
  ok("/admin/projects");
}

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageContent(user.role)) return { error: "Your role cannot edit the journal." };
  const title = str(formData, "title");
  const excerpt = str(formData, "excerpt");
  const body = str(formData, "body");
  if (title.length < 4 || body.length < 20) return { error: "Title and article body are required." };
  const id = str(formData, "id");
  const data = {
    title,
    excerpt,
    body,
    image: str(formData, "image") || null,
    kind: str(formData, "kind") === "blog" ? "blog" : "news",
    published: formData.get("published") === "yes",
  };
  if (id) await prisma.post.update({ where: { id }, data });
  else {
    let slug = slugify(title);
    if (await prisma.post.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString().slice(-4)}`;
    await prisma.post.create({ data: { ...data, slug } });
  }
  ok("/admin/posts");
}

export async function saveFaq(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageContent(user.role)) return { error: "Your role cannot edit FAQs." };
  const question = str(formData, "question");
  const answer = str(formData, "answer");
  if (question.length < 4 || answer.length < 4) return { error: "Question and answer are required." };
  const id = str(formData, "id");
  const data = {
    question,
    answer,
    sortOrder: Number.isFinite(num(formData, "sortOrder")) ? num(formData, "sortOrder") : 0,
    active: formData.get("active") === "yes",
  };
  if (id) await prisma.faq.update({ where: { id }, data });
  else await prisma.faq.create({ data });
  ok("/admin/faqs");
}

export async function saveDelivery(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageDelivery(user.role)) return { error: "Your role cannot edit delivery rates." };
  await prisma.deliverySettings.update({
    where: { id: "default" },
    data: {
      depotName: str(formData, "depotName"),
      depotAddress: str(formData, "depotAddress"),
      depotLat: num(formData, "depotLat"),
      depotLng: num(formData, "depotLng"),
      baseCharge: num(formData, "baseCharge"),
      perKm: num(formData, "perKm"),
      minCharge: num(formData, "minCharge"),
      fuelSurchargePct: num(formData, "fuelSurchargePct"),
      roadFactor: num(formData, "roadFactor"),
      extraCharge: num(formData, "extraCharge"),
    },
  });
  await audit("update", "delivery", "default", "rates", user.email);
  ok("/admin/delivery");
}

export async function saveZone(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageDelivery(user.role)) return { error: "Your role cannot edit zones." };
  const name = str(formData, "name");
  if (name.length < 2) return { error: "Zone name is required." };
  const id = str(formData, "id");
  const data = {
    name,
    area: str(formData, "area") || "Harare",
    distanceKm: num(formData, "distanceKm"),
    lat: num(formData, "lat"),
    lng: num(formData, "lng"),
    active: formData.get("active") === "yes",
  };
  if (![data.distanceKm, data.lat, data.lng].every(Number.isFinite)) return { error: "Distance and coordinates must be numbers." };
  if (id) await prisma.zone.update({ where: { id }, data });
  else await prisma.zone.create({ data });
  ok("/admin/delivery");
}

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!canManageDelivery(user.role)) return { error: "Your role cannot edit vehicles." };
  const name = str(formData, "name");
  const capacityKg = num(formData, "capacityKg");
  const surcharge = num(formData, "surcharge");
  if (name.length < 2 || !Number.isFinite(capacityKg) || capacityKg <= 0) return { error: "Vehicle name and capacity are required." };
  const id = str(formData, "id");
  const data = {
    name,
    capacityKg,
    surcharge: Number.isFinite(surcharge) ? surcharge : 0,
    sortOrder: Number.isFinite(num(formData, "sortOrder")) ? num(formData, "sortOrder") : 0,
    active: formData.get("active") === "yes",
  };
  if (id) await prisma.vehicle.update({ where: { id }, data });
  else await prisma.vehicle.create({ data });
  ok("/admin/delivery");
}

export async function saveSettings(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!["super_admin", "management"].includes(user.role)) return { error: "Your role cannot edit settings." };
  await prisma.siteSetting.update({
    where: { id: "default" },
    data: {
      phone: str(formData, "phone"),
      whatsapp: str(formData, "whatsapp"),
      email: str(formData, "email"),
      address: str(formData, "address"),
      hours: str(formData, "hours"),
      about: str(formData, "about"),
      validityDays: Math.max(1, Math.round(num(formData, "validityDays") || 7)),
      disclaimer: str(formData, "disclaimer"),
    },
  });
  await audit("update", "settings", "default", "site", user.email);
  ok("/admin/settings");
}

export async function saveUser(_prev: FormState, formData: FormData): Promise<FormState> {
  const actor = await requireUser();
  if (!canManageTeam(actor.role)) return { error: "Only a super administrator can manage accounts." };
  const email = str(formData, "email").toLowerCase();
  const name = str(formData, "name");
  const role = str(formData, "role");
  const password = String(formData.get("password") ?? "");
  const id = str(formData, "id");
  if (!ROLES.some((item) => item.id === role)) return { error: "Choose a role." };
  if (name.length < 2 || !email.includes("@")) return { error: "Name and email are required." };
  if (!id && password.length < 8) return { error: "New accounts need a password of at least 8 characters." };
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && existing.id !== id) return { error: "That email is already in use." };
  const data: { name: string; email: string; role: string; phone: string | null; active: boolean; passwordHash?: string } = {
    name,
    email,
    role,
    phone: str(formData, "phone") || null,
    active: formData.get("active") === "yes",
  };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  if (id) {
    if (actor.id === id && data.active === false) return { error: "You cannot deactivate your own account." };
    await prisma.user.update({ where: { id }, data });
  } else {
    await prisma.user.create({ data: { ...data, passwordHash: data.passwordHash! } });
  }
  await audit("save", "user", email, role, actor.email);
  ok("/admin/team");
}

export async function markNotificationsRead() {
  const user = await requireUser();
  await prisma.notification.updateMany({ data: { read: true } });
  await audit("read", "notification", undefined, undefined, user.email);
  revalidatePath("/admin");
  revalidatePath("/admin/notifications");
}
