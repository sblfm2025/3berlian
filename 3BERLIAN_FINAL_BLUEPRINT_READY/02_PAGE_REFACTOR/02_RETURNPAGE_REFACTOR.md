# RETURNPAGE REFACTOR

## Objective
Merapikan workflow pengembalian agar cepat, compact, dan mudah dipindai.

## Current Problems
- Return cards terlalu besar.
- Informasi detail terlalu panjang.
- Overdue dan normal return belum cukup dibedakan.
- Tombol konfirmasi terlalu besar di mobile.
- Filter memakan ruang.

## Scope
ONLY MODIFY:
- `src/pages/ReturnPage.jsx`
- komponen/hook UI Return bila sudah dipisah

## Files To Avoid
DO NOT MODIFY:
- stock restore logic
- return calculation logic
- Firebase services
- payment logic

## UX Priority
1. Overdue return
2. Return due today
3. Active return
4. Penalty/additional payment
5. Notes/detail

## Technical Rules

### Return Cards
Use compact operational layout:
```txt
p-3 sm:p-4
rounded-2xl
border
shadow-sm
```

Card content priority:
```txt
Customer/Invoice
Due date/status
Item count
Penalty/additional fee
Action button
```

### Overdue Emphasis
Only overdue items get strong emphasis:
- red/orange accent
- stronger badge
- clear label

Normal return:
- calm style
- subtle border
- no heavy warning color

### Confirmation Button
Replace:
```txt
py-4 text-lg -> py-3 sm:py-4 text-sm sm:text-base
```

### Filters
Use compact chips:
```txt
px-3 py-1.5 text-xs
```

### Details
Make long detail expandable:
- item condition
- notes
- payment detail
- return history

## Expected Result
- Return workflow lebih cepat.
- Operator bisa langsung melihat overdue.
- Mobile tidak penuh oleh detail.
- Konfirmasi tetap jelas.

## QA Checklist
- Return flow tetap jalan.
- Denda tetap benar.
- Stok restore tidak berubah.
- Detail tetap bisa dibuka.
- Tidak ada overflow mobile.
