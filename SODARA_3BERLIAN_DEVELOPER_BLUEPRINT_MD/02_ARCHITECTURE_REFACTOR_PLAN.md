# Architecture Refactor Plan

## 1. Masalah Arsitektur Saat Ini

Masalah umum yang harus dicegah:
- `App.jsx` terlalu besar
- logic transaksi bercampur dengan UI
- Firebase logic terlalu dekat dengan component
- validasi tersebar
- kalkulasi laporan tersebar
- state terlalu banyak di component
- handler panjang dan sulit dites

## 2. Target Layer Architecture

Gunakan pola:

```txt
UI Layer
↓
Application Layer
↓
Domain Layer
↓
Repository Layer
↓
Infrastructure Layer
```

### UI Layer
Berisi:
- page
- layout
- component visual
- form
- modal
- table
- card

Tidak boleh:
- query Firestore langsung
- menghitung stok final
- membuat invoice final
- mengubah status transaksi tanpa service

### Application Layer
Berisi:
- use case
- orchestration
- submit checkout
- submit return
- create booking
- generate report

### Domain Layer
Berisi:
- business rules
- rental status machine
- inventory lifecycle
- denda
- deposit
- validation rules

### Repository Layer
Berisi:
- abstraction untuk Firestore
- function CRUD
- query terpusat
- mapping document

### Infrastructure Layer
Berisi:
- Firebase config
- Firestore client
- storage client
- monitoring

## 3. Struktur Folder Target

```txt
src/
 ├── app/
 │    ├── AppShell.jsx
 │    ├── routes.jsx
 │    └── providers.jsx
 ├── pages/
 │    ├── DashboardPage.jsx
 │    ├── RentPage.jsx
 │    ├── ReturnPage.jsx
 │    ├── ProductsPage.jsx
 │    ├── CustomersPage.jsx
 │    └── ReportsPage.jsx
 ├── layouts/
 ├── components/
 │    ├── ui/
 │    ├── forms/
 │    ├── tables/
 │    ├── feedback/
 │    └── navigation/
 ├── domains/
 │    ├── rental/
 │    ├── inventory/
 │    ├── customer/
 │    ├── finance/
 │    ├── reporting/
 │    ├── booking/
 │    └── maintenance/
 ├── repositories/
 ├── services/
 ├── hooks/
 ├── stores/
 ├── validators/
 ├── constants/
 ├── utils/
 └── types/
```

## 4. Refactor App.jsx

### Target
`App.jsx` hanya menjadi shell.

Isi ideal:
- providers
- routing
- layout wrapper
- global error boundary
- global toast

Tidak boleh lagi:
- logic checkout
- logic return
- Firestore listener detail
- delete transaction logic
- modal bisnis kompleks
- PWA install logic penuh

## 5. Modul Yang Harus Dibuat

### Rental Module
File:
```txt
domains/rental/rental.types.js
domains/rental/rental.constants.js
domains/rental/rental.validation.js
domains/rental/rental.calculator.js
domains/rental/rental.service.js
domains/rental/rental.repository.js
domains/rental/hooks/useRentalCheckout.js
```

### Inventory Module
```txt
domains/inventory/inventory.types.js
domains/inventory/inventory.constants.js
domains/inventory/inventory.service.js
domains/inventory/inventory.repository.js
domains/inventory/inventory.lifecycle.js
```

### Reporting Module
```txt
domains/reporting/reporting.service.js
domains/reporting/reporting.repository.js
domains/reporting/reporting.exporter.js
domains/reporting/reporting.calculator.js
```

## 6. State Management

Gunakan store terpisah:
- `useSessionStore`
- `useCartStore`
- `useRentalStore`
- `useInventoryStore`
- `useUiStore`

Jangan semua state masuk App.

## 7. Checklist Refactor

- [ ] App.jsx hanya shell.
- [ ] Firebase query dipindah ke repository.
- [ ] Business logic dipindah ke domain service.
- [ ] Validasi dipusatkan.
- [ ] Komponen UI dibuat reusable.
- [ ] Hook dipisah per use case.
- [ ] Delete/edit transaction tidak langsung di page.
- [ ] Error boundary tersedia.
- [ ] Toast global tersedia.
- [ ] Mode demo tetap berjalan.
