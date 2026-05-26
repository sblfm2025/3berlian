# FIREBASE ARCHITECTURE

## Objective
Meningkatkan scalability Firebase tanpa mengubah login/account terlebih dahulu.

## Current Problems
- Full collection listeners.
- Semua transaksi berpotensi ditarik ke client.
- Dashboard dan Reports bisa berat ketika data besar.
- Realtime listener belum sepenuhnya scoped.

## Scope
Firebase data loading strategy.

## Do Not Modify Yet
- Auth/login
- production collection names
- security rules tanpa audit
- existing data schema tanpa migration plan

## Query Strategy

### Avoid
```txt
listen to all transactions globally
filter all reports client-side
load all customers/products if not needed
nested realtime listeners
```

### Use
```txt
query by status
query by date range
limit()
orderBy()
startAfter()
onSnapshot only for active operational data
getDocs for historical reports when realtime is not needed
```

## Page-Specific Rules

### Dashboard
Load:
- active rentals only
- overdue returns
- low stock products
- lightweight metrics

Avoid:
- full historical transaction load

### Reports
Use:
- selected month/date range
- status filter
- pagination
- lazy detail fetch

### ReturnPage
Load:
- active rentals
- overdue rentals
- due today

### Products
If product count grows:
- category filters
- pagination
- lazy search

## Listener Management
Always:
- return unsubscribe
- avoid listener inside loop
- avoid duplicate snapshot subscriptions

## Expected Result
- Faster initial load.
- Lower Firebase read usage.
- Reports scalable.
- Dashboard lightweight.
