# Recommended next build slice

**Context:** Desk scoping, credit, formal quotes, bank/credit payment choice, portal depth, and solar configurator shipped. Remaining work needs merchant / Meta / fleet decisions from CBH.

---

## Default priority (highest first)

### 1. Live payment gateway webhook

**Why first:** Bank transfer + staff confirm already work. Card / EcoCash / Paynow settlement closes the loop.

**Ship:**
- Confirm Zimbabwe gateway with CBH (Paynow ID field already in settings)
- Pay link or checkout on order request
- Webhook writes `paymentStatus` / `paidAt`; keep staff override

**Depends on:** Merchant KYC, gateway keys, refunds policy.

---

### 2. WhatsApp Business API go-live

**Why second:** Adapter exists (`WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID`); needs Meta verification.

**Ship:**
- Template messages for new quote / order
- Staff reply via WhatsApp Business app or API inbox

**Depends on:** Verified Meta business, phone number, conversation budget.

---

### 3. Formal invoices after payments

**Why third:** Natural once gateway is live.

**Ship:**
- Invoice PDF from paid orders
- Account history shows paid invoices

---

### 4. Fleet / delivery ops (Phase 4)

**Why later:** Desk already has vehicle, driver, delivery date, status chain.

**Ship:**
- Route board / driver view
- Customer delivery ETA SMS/WA

---

## Already shipped (do not re-brief as outstanding)

- Salesperson-scoped leads / quotes / orders + management KPIs + follow-ups
- Formal quote mark + email
- Contractor credit status / limit + order guards
- Order payment method (bank / arrange / credit) + staff payment confirm
- Customer portal (phone+email match, locations, reorder)
- Solar configurator → quote/cart
- Stock qty checks on quote/order
- Promotions audience on storefront + campaign signals on desk

---

## Suggested workshop questions for CBH

1. Preferred live payment rail (Paynow, EcoCash, bank-only for now)?  
2. Ready for Meta WhatsApp Business verification this quarter?  
3. Do invoices wait until gateway go-live?
