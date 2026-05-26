# PRODUCTS, CUSTOMERS, NAVIGATION REFACTOR

## Objective
Merapikan halaman pendukung agar konsisten dengan UI compact superapp.

---

# ProductsPage

## Scope
ONLY MODIFY:
- `src/pages/ProductsPage.jsx`

## Rules
Product inventory cards should show:
1. product name
2. stock
3. availability
4. price
5. quick action

Use:
```txt
p-3 sm:p-4
rounded-2xl
text-sm title
text-xs meta
compact badge
```

Avoid:
- giant image
- giant card
- too many actions visible at once

Future-ready:
- productType: rental_product | accessory | property | package_item

---

# CustomersPage

## Scope
ONLY MODIFY:
- `src/pages/CustomersPage.jsx`

## Rules
Customer list should prioritize:
1. name
2. phone
3. recent activity
4. active transaction status

Use compact row/card:
```txt
p-3
rounded-2xl
border
text-sm name
text-xs metadata
```

Long customer history should be expandable.

Future-ready:
- booking history
- event history
- service preferences

---

# Navigation

## Scope
Modify:
- navigation config
- layout component
- bottom nav component

## Rules
Max 5 bottom nav items:
1. Dashboard
2. Sewa
3. Kembali
4. Laporan
5. Menu

Future modules go to Menu:
- Services
- Events
- Talents
- Packages
- Finance

## Bottom Nav Style
```txt
fixed bottom-0
safe-area aware
icon 20px
label text-[10px]
height compact
```

Avoid:
- oversized icons
- tall nav
- too many menu items
