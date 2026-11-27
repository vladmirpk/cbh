# CBH brief — Phase acceptance & backlog

**Audience:** Consolidated Bricks & Hardware management  
**Purpose:** Honest sign-off of what is live today vs what remains for later phases  
**Statuses:** Delivered | Partial | Not built

---

## One-line verdict

CBH has a **live digital sales, marketing, quotation, lead, credit-flag, and order-request platform** (Phase 1–2 plus core Phase 3 desk/portal/credit). **Live card / EcoCash gateway checkout** still needs merchant keys; Paynow ID and bank details are configurable meanwhile.

**Sales WhatsApp / phone (live):** `+263 78 515 3169` — wired into site settings, header, dock, product/quote WhatsApp links.

---

## Phase 1 — Digital foundation

| Brief item | Status | Acceptance note |
| --- | --- | --- |
| Corporate website (home, about, contact) | Delivered | Live on the public site |
| Product catalogue + categories | Delivered | Categories index + admin CRUD |
| Product pages (photos, specs, price, MOQ, status, brand, colour/size, use case, features, tags, install) | Delivered | Halsteds-grade attributes; stock rules gate quote/cart — see `docs/catalogue-attributes.md` |
| Upcoming products + register interest | Delivered | Captures contact + quantity |
| Product launch pages | Delivered | Limited to upcoming / pre-order stock |
| Advertising / promotions | Delivered | Audience + target area; desk campaign signals |
| Lead capture from forms & quotes | Delivered | Every enquiry becomes a CRM lead |
| WhatsApp click-to-chat | Delivered | Prefills product/quote context |
| WhatsApp Business API | Partial | Adapter live when `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` set |
| Quote request / provisional quote | Delivered | Multi-product + delivery estimate + email/WA notify |
| Admin dashboard | Delivered | Roles + follow-ups + rep KPIs + sources |
| Basic lead management | Delivered | Pipeline + claim + notes; stage moves require confirmation note, reason tag, optional follow-up |
| SEO basics | Partial | Titles, sitemap, product JSON-LD |
| Analytics | Partial | Desk metrics; GA when `NEXT_PUBLIC_GA_ID` set |
| Mobile optimisation | Delivered | Mobile dock, quote, forms, WhatsApp |

---

## Phase 2 — Smart quotations

| Brief item | Status | Acceptance note |
| --- | --- | --- |
| Customer location (suburb / pin / share) | Delivered | Google Maps pin needs Maps API key |
| Distance + delivery pricing engine | Delivered | Zones, vehicles, rates editable in desk |
| Provisional quotation + disclaimer | Delivered | Numbered quote with validity |
| Formal quotation | Delivered | Desk “Mark formal”; emails customer when address present |
| PDF quotation | Delivered | Public + desk |
| Customer database | Delivered | Grouped by phone; credit fields |
| Salesperson desk | Delivered | Scoped leads/quotes/orders; management sees all + KPIs |

---

## Customer journey (brief §36)

| Step | Status today |
| --- | --- |
| Advertisement → product discovery | Delivered — promotions + audience; desk campaign signals |
| Product information | Delivered |
| Location & quantity | Delivered |
| Provisional quote | Delivered |
| Lead captured | Delivered |
| Salesperson follow-up | Delivered — CRM + due list + scoped desk |
| Formal quote | Delivered |
| Order | Delivered — request with payment method; desk intervene |
| Payment | Partial — bank / credit / arrange + staff confirm; gateway webhook when merchant live |
| Delivery logistics | Partial — statuses + vehicle/driver; no fleet app |
| Repeat purchase | Delivered — account history by email/phone, locations, reorder links |

---

## Phase 3 — Digital sales platform

| Item | Status | Note |
| --- | --- | --- |
| Payment method on order request | Delivered | Bank / arrange / approved credit |
| Bank details + Paynow ID in settings | Delivered | Shown on public quote when set |
| Staff payment confirm | Delivered | Status, method, reference, paidAt |
| Salesperson-scoped desk + management performance | Delivered | `leadScope` / `quoteScope` / `orderScope` |
| Customer portal depth | Delivered | Quotes, orders, credit strip, saved locations |
| Contractor credit programme | Delivered | Limit + status; blocks over-limit / suspended |
| Live payment gateway webhook | Not built | Needs merchant KYC + keys |

---

## Phase 4 starters

| Item | Status |
| --- | --- |
| Solar configurator MVP | Delivered — `/solar-configurator` → quote/cart |
| Stock qty enforcement on quote/order | Delivered |
| Campaign performance signals | Partial — linked lead heuristic on desk |

---

## Brand & desk UX (post-brief polish)

| Item | Status | Note |
| --- | --- | --- |
| Official logo on site + quote/order PDFs | Delivered | Roof lockup `public/cbh_images/cbh_logo.jpeg` |
| Public sales contact | Delivered | `+263 78 515 3169` |
| Hero banners + product photography | Delivered | Local `/cbh_images/*` catalogue |
| Admin preview / edit / delete confirmations | Delivered | Customers, quotes, orders, catalogue, marketing, team, settings, audit |
| CRM stage confirmation + timeline | Delivered | `LeadEvent` history on every move |

---

## Still deferred (needs CBH / providers)

1. Live Paynow / EcoCash / card webhook settlement  
2. Full Meta WhatsApp Business inbox (adapter ready; verification + fees)  
3. Fleet / route optimisation app  
4. Formal invoices after gateway go-live  

---

## Env flags for optional channels

- `RESEND_API_KEY` + `NOTIFY_FROM` — quote/order emails  
- `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` — Cloud API texts  
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` — pin picker  
- `NEXT_PUBLIC_GA_ID` — analytics  
