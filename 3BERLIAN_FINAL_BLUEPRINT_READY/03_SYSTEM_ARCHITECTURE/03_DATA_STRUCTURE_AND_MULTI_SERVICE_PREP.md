# DATA STRUCTURE AND MULTI-SERVICE PREPARATION

## Objective
Mempersiapkan struktur data agar aplikasi tidak terkunci hanya sebagai rental pakaian.

## Current Direction
Saat ini sistem fokus rental. Ke depan sistem perlu mendukung:
- rental product
- service
- package
- event booking
- talent assignment

## Important Rule
Jangan implementasi penuh fitur jasa sekarang. Siapkan arsitekturnya saja.

## Generic Item Types
```txt
rental_product
accessory
property
service
package
```

## Future Order Model
Suggested future structure:
```json
{
  "id": "ORD-001",
  "orderType": "rental | service | package | mixed",
  "customerId": "CUS-001",
  "rentals": [],
  "services": [],
  "packages": [],
  "schedule": {
    "startAt": "timestamp",
    "endAt": "timestamp",
    "location": "string"
  },
  "payments": [],
  "status": "draft | active | completed | cancelled",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Future Service Model
```json
{
  "id": "SRV-001",
  "name": "MC Wedding",
  "serviceType": "MC | Tari | Singer | Music",
  "basePrice": 0,
  "durationMinutes": 120,
  "talentIds": [],
  "isActive": true
}
```

## Future Talent Model
```json
{
  "id": "TAL-001",
  "name": "Nama Talent",
  "talentType": "MC | Dancer | Singer | Musician",
  "phone": "string",
  "availabilityStatus": "available | booked | inactive",
  "rate": {},
  "notes": "string"
}
```

## Future Booking Workflow
1. inquiry
2. quotation
3. booking confirmation
4. DP/payment
5. talent assignment
6. event execution
7. completion/report

## Current Implementation Guidance
Saat refactor UI:
- hindari istilah hardcoded yang terlalu sempit bila tidak perlu
- jangan semua model baru disebut “rental”
- sisakan ruang navigasi untuk Services/Events/Talents
