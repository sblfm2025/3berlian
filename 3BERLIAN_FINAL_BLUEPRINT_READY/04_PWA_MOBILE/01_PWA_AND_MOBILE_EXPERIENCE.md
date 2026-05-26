# PWA AND MOBILE EXPERIENCE

## Objective
Membuat aplikasi terasa seperti aplikasi mobile native, bukan website biasa.

## Scope
- safe area
- bottom navigation
- keyboard behavior
- back gesture
- install prompt

## Safe Area Rules
Use CSS safe-area:
```css
padding-bottom: env(safe-area-inset-bottom);
```

Bottom nav harus:
- tidak tertutup gesture bar
- tidak melayang di posisi salah
- tidak menutup tombol checkout penting

## Bottom Navigation Rules
Max 5 primary tabs:
1. Dashboard
2. Sewa
3. Kembali
4. Laporan
5. Menu

Style:
```txt
icon: 20px
label: text-[10px]
height: compact
active indicator subtle
```

## Keyboard Handling
When input focused:
- avoid hidden input
- avoid broken sticky bottom
- avoid layout jump
- keep submit button accessible if relevant

## Back Gesture
Implement contextual back:
- from detail to list
- from modal to previous state
- from nested page to previous page
- fallback to dashboard if history unavailable

## Install App Prompt
Use:
- lightweight modal
- clear install CTA
- short benefit explanation
- app icon branding

Avoid:
- intrusive repeated popup
- full-screen blocking install message
