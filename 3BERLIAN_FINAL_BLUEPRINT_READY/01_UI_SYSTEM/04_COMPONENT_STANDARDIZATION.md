# COMPONENT STANDARDIZATION

## Objective
Membuat seluruh UI konsisten agar tidak terlihat seperti campuran banyak style.

## Button System

### Primary Button
Gunakan untuk:
- checkout
- konfirmasi pengembalian
- simpan perubahan penting

Style:
```txt
text-sm sm:text-base
py-2.5 sm:py-3
rounded-xl sm:rounded-2xl
font-semibold
```

### Secondary Button
Gunakan untuk:
- filter
- detail
- edit non-kritis

Style:
```txt
border
bg-white/70
text-xs sm:text-sm
py-2
```

### Ghost Button
Gunakan untuk:
- icon action
- quick navigation
- collapsible trigger

## Card System

### Operational Card
Untuk list harian:
```txt
p-3 sm:p-4
rounded-2xl
border
shadow-sm
```

### Highlight Card
Untuk info penting:
```txt
p-4 sm:p-5
rounded-2xl
shadow-md
brand accent
```

### Supporting Card
Untuk tips/statistik:
```txt
p-3
rounded-xl
bg-muted/40
border subtle
```

## Input System
Mobile:
```txt
px-3 py-2.5 text-sm rounded-xl
```

Desktop:
```txt
sm:px-4 sm:py-3
```

## Badge System
```txt
text-[10px] sm:text-xs
px-2 py-1
rounded-full
font-medium
```

## Modal System
- Mobile: full-width bottom sheet style jika memungkinkan.
- Desktop: centered modal.
- Jangan gunakan modal terlalu tinggi tanpa scroll internal.
