# CODEX EXECUTION RULES

## Objective
Membuat VS/Codex mengeksekusi refactor lebih presisi.

## Prompt Format
Gunakan format:

```md
# Objective

# Scope

# Files To Modify

# Files To Avoid

# Exact Changes

# Constraints

# Expected Result

# QA Checklist
```

## Good Prompt Example
```md
Objective:
Compact RentPage product cards on mobile.

Files To Modify:
- src/pages/RentPage.jsx

Files To Avoid:
- src/services/firestoreData.js

Exact Changes:
- Convert product card to horizontal tile.
- Use image 56x56.
- Reduce card padding to p-3.
- Use title text-sm line-clamp-2.
- Keep checkout logic unchanged.

Expected Result:
- 4 products visible on mobile.
- No checkout logic changes.
```

## Bad Prompt Example
```txt
Make the app look like Shopee and make it modern.
```

Why bad:
- too broad
- no files
- no constraints
- no measurable output

## Branch Strategy
Use:
```txt
feature/ui-foundation
feature/mobile-density
feature/rentpage-refactor
feature/returnpage-refactor
feature/dashboard-refactor
feature/reports-refactor
feature/firebase-transaction-safety
```

## Safe Refactor Rules
Never:
- rewrite whole app
- rename collections without migration
- edit login/account
- mix UI refactor and Firebase transaction refactor
- change calculation logic during UI work

Always:
- run app after each stage
- test mobile
- test checkout
- test return
- commit small changes
