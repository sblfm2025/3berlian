# STATE MANAGEMENT AND PERFORMANCE

## Objective
Menjaga aplikasi tetap ringan dan maintainable ketika fitur/data bertambah.

## Current Risks
- Giant page components.
- Derived state terlalu banyak.
- Rerender besar saat data berubah.
- Product/report list bisa berat.

## Component Splitting Rules
Untuk halaman besar seperti RentPage, pisahkan menjadi:
```txt
hooks/
  useCartWorkflow.js
  useProductFilters.js
  useCheckoutSummary.js

components/
  ProductTile.jsx
  CartSummary.jsx
  CustomerSelector.jsx
  CheckoutPanel.jsx
```

## State Rules
Avoid:
- duplicated state
- deeply nested state
- global state untuk data lokal
- recalculation on every render

Use:
- `useMemo` untuk derived totals/filtering
- `useCallback` untuk handler besar
- local state untuk UI-only state
- separated hooks untuk workflow

## Performance Rules
Use:
- lazy loading for heavy pages
- skeleton loading
- pagination
- virtualization for long lists if product/report data grows

Avoid:
- full array filter repeatedly in render body
- huge inline functions in mapped lists
- loading all reports at once

## QA Checklist
- Scroll tetap smooth.
- Search product tidak lag.
- Reports tidak freeze.
- Dashboard load cepat.
