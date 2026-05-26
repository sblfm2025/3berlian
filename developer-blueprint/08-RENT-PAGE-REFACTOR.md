# Rent Page Refactor

RentPage harus menjadi composer.

Struktur:
features/rental/components/
- ProductCatalog
- ProductCard
- RentalCart
- CheckoutPanel
- CustomerQuickForm
- PaymentSummary
- RentalMobileBar

features/rental/hooks/
- useRentalCart
- useRentalCheckout
- useRentalFilters

Logic checkout tidak boleh ada langsung di JSX.
