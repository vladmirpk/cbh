# Consolidated Bricks & Hardware

A sales platform for CBH: catalogue, provisional quotations with delivery, lead desk, and a staff dashboard. The catalogue is category-led, so solar, lighting and later lines are new records rather than a new website.

## Run it locally

```bash
npm install
npx prisma generate
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The staff desk is [http://localhost:3000/admin](http://localhost:3000/admin).

Demo password for every seeded account: `Cbh-Yard-2026`

| Email | Role |
| --- | --- |
| admin@cbh.co.zw | Super administrator |
| management@cbh.co.zw | Management |
| sales@cbh.co.zw | Salesperson |
| marketing@cbh.co.zw | Marketing |
| operations@cbh.co.zw | Operations |

Change those passwords, `AUTH_SECRET`, the WhatsApp number and the address in Settings before the site is public.

## What is included

- Public site: home, about, yard, categories, product pages, upcoming products, launch pages, promotions, projects, delivery, journal, contact, contractor enquiry
- Provisional quote: suburb list, shared location, optional Google Map pin, live materials + delivery total, PDF, WhatsApp handoff, order request
- Delivery rate card: zones, vehicles, base, per km, minimum, fuel, extras — edited in the desk
- Leads from new → contacted → quoted → negotiating → won → lost, with source, notes, follow-up and salesperson
- Orders from requested through delivered
- CSV export of leads, quotes, products and orders
- Roles, hashed passwords, audit log, in-app alerts, optional Resend email

Customer register/login exists but the account portal is thin (history matched by email). Card payments, the solar configurator and WhatsApp Business API messaging are not switched on. Click-to-chat WhatsApp works now. Set `RESEND_API_KEY`, `NOTIFY_EMAIL` and `NOTIFY_FROM` for email alerts. Set `NEXT_PUBLIC_GA_ID` for Google Analytics and `NEXT_PUBLIC_GOOGLE_MAPS_KEY` for the pin map. Suburb quoting works without a maps key.

### Brief coverage (client sign-off)

- [Phase acceptance & backlog](docs/brief-acceptance.md) — what Phase 1–2 deliver vs Phase 3–4 backlog  
- [Next build priority](docs/next-build-priority.md) — recommended order if CBH has not ranked gaps yet

## Stack and hosting

Next.js, React, TypeScript, Tailwind, Prisma and PostgreSQL. Passwords use bcrypt. Sessions are signed HTTP-only cookies.

Host the Node server behind HTTPS. Put the real domain in `NEXT_PUBLIC_SITE_URL`.

### Render environment variables

Paste into the web service Environment (use the **Internal** Database URL from your Render Postgres instance):

```env
DATABASE_URL=postgresql://USER:PASSWORD@INTERNAL_HOST/cbh
AUTH_SECRET=replace-with-a-long-random-string
NEXT_PUBLIC_SITE_URL=https://YOUR-SERVICE-NAME.onrender.com
```

Build command: `npm install && npm run build`  
Start command: `npm start` (runs `db push` and seeds once if there are no users)

Optional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`, `RESEND_API_KEY`, `NOTIFY_EMAIL`, `NOTIFY_FROM`.

## Third-party costs to budget separately

These are provider prices, not a build fee. Confirm them when you open the accounts.

- Google Maps JavaScript API: billed per map load. Low traffic is often inside Google’s monthly credit; a busy month is typically tens of US dollars.
- WhatsApp click-to-chat: no Meta conversation fee. The WhatsApp Business API, if you later want messages sent from the server, is billed per conversation and needs a verified business account.
- Email via Resend: a free tier covers early alert volume.
- Hosting: a small VPS is usually in the range of a few dollars to a few tens of dollars a month, plus the domain.
- Analytics: Google Analytics has no licence fee.

## Security and ownership

HTTPS belongs on the host. The app sets basic security headers, hashes passwords, keeps customer records off the public site, and writes an audit log for sign-ins and record changes. API keys stay in environment variables.

CBH owns this source, the database, the content and any API accounts opened in CBH’s name. Export CSV from the desk at any time. Nothing here is a locked proprietary licence.
