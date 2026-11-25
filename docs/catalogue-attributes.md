# Catalogue attributes (Halsteds benchmark)

CBH captures the commercial fields Halsteds-style hardware PDPs use, then presents them in a cleaner quote-first journey.

## Captured on every product (admin)

| Field | Storefront use |
| --- | --- |
| Name, SKU, brand, model number, barcode | Identity on PDP + JSON-LD |
| Category, unit (UOM), MOQ | Quote / cart rules |
| Colour / finish, size, pack size | Filters + specs table |
| Price, promo price | Cards + buy box |
| Stock qty, status | “X in yard” / status pill |
| Lead time days + note | Pre-order / on-order copy |
| Description | Short intro |
| Use case | “What it’s used for” |
| Features (bullets) | “Key features” |
| Specs (label \| value) | Extra technical rows (wattage, IP, etc.) |
| Weight, delivery notes, warranty, datasheet | Logistics + downloads |
| Gallery, tags, related slugs, SEO | Discovery |

## Improved vs Halsteds

- **Quote + delivery engine** instead of cart-only checkout as the primary CTA  
- **Single Workington yard** stock (no multi-branch store switcher in this phase)  
- Compact cards and structured PDP sections (Specs / Used for / Features)  
- Specs stay flexible via `Label | Value` so trade attributes are not hard-coded per category  

## Deferred

- Multi-branch “current store” inventory and pricing  
- Wish list / compare widgets  
