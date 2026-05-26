# Stock Management

Struktur resmi:
- stockTotal
- stockAvailable
- stockRented
- stockLaundry
- stockDamaged

Aturan:
- barang disewa: available turun, rented naik
- barang kembali baik: available naik, rented turun
- barang laundry: laundry naik, rented turun
- barang rusak/hilang: damaged naik, rented turun
- semua koreksi stok wajib punya alasan dan audit log
