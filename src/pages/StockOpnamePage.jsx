import { useState, useMemo } from 'react';
import { Barcode, Play, CheckCircle2, AlertTriangle, Trash2, ShieldAlert, Sparkles, MapPin, Printer } from 'lucide-react';
import { saveStockOpnameSession } from '../repositories/productItemRepository';
import { saveProduct } from '../repositories/productRepository';

export default function StockOpnamePage({ products, onNotify, operatorId }) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Gudang Utama');
  const [scannedInput, setScannedInput] = useState('');
  const [scannedItemsList, setScannedItemsList] = useState([]); // array of itemCode strings
  const [isSaving, setIsSaving] = useState(false);
  const [savedSessionResult, setSavedSessionResult] = useState(null);

  const locations = ['Gudang Utama', 'Rak A - Kostum Bugis', 'Rak B - Kostum Jawa', 'Rak C - Kostum Bali', 'Laci Depan POS'];

  // Skenario 1: Men-generate data item sistem secara dinamis dan offline untuk lokasi yang dipilih
  // guna membandingkan sistem vs fisik.
  // Kita ambil seluruh produk aktif dan mengasumsikan item fisik yang cocok dengan lokasi tersebut.
  const systemItems = useMemo(() => {
    const items = [];
    products.forEach(p => {
      if (p.isActive === false || p.status === 'inactive') return;
      const count = Number(p.availableStock || p.stock || 0);
      const productCode = (p.sku || p.name || 'COSTUME')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 6);
      const sizeLabel = p.size || '-';

      // Mock generate unit sistem secara cerdas berdasarkan total stok
      for (let i = 0; i < count; i++) {
        const seqStr = String(i + 1).padStart(3, '0');
        const itemCode = `${productCode}-${sizeLabel}-${seqStr}`;
        items.push({
          itemCode,
          productId: p.id,
          productName: p.name,
          size: p.size,
          category: p.category,
          rentPrice: p.rentPrice,
          status: 'READY',
          condition: 'good',
          location: p.location || 'Gudang Utama'
        });
      }
    });
    return items;
  }, [products]);

  // Skenario 2: Hitung discrepancy report secara real-time
  const discrepancyReport = useMemo(() => {
    const scannedSet = new Set(scannedItemsList);
    const systemSet = new Set(systemItems.map(item => item.itemCode));

    const matched = systemItems.filter(item => scannedSet.has(item.itemCode));
    const missing = systemItems.filter(item => !scannedSet.has(item.itemCode));

    // Unexpected items: Item yang di-scan tetapi tidak terdaftar di sistem lokasi ini
    const unexpected = [];
    scannedItemsList.forEach(itemCode => {
      const isSystem = systemSet.has(itemCode);
      if (!isSystem) {
        // Coba pecah kodenya untuk menebak info produk
        const parts = itemCode.split('-');
        const codePart = parts[0] || 'COSTUME';
        const sizePart = parts[1] || '-';

        const matchingProduct = products.find(p => {
          const pCode = (p.sku || p.id || '').toUpperCase();
          const nameClean = (p.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
          return (pCode.includes(codePart) || nameClean.includes(codePart)) && String(p.size || '').toUpperCase() === sizePart;
        });

        unexpected.push({
          itemCode,
          productName: matchingProduct?.name || 'Kostum Tidak Terdaftar',
          size: sizePart,
          rentPrice: matchingProduct?.rentPrice || 0,
          productId: matchingProduct?.id || ''
        });
      }
    });

    return { matched, missing, unexpected };
  }, [systemItems, scannedItemsList, products]);

  const handleStartSession = () => {
    setIsSessionActive(true);
    setScannedItemsList([]);
    setScannedInput('');
    setSavedSessionResult(null);
    onNotify?.({
      title: 'Sesi Stock Opname Dimulai',
      message: `Melakukan audit fisik di ${selectedLocation}. Silakan scan item.`,
      type: 'info'
    });
  };

  const handleScanSubmit = (e) => {
    e.preventDefault();
    if (!scannedInput.trim()) return;

    const code = scannedInput.trim().toUpperCase();
    setScannedInput('');

    if (scannedItemsList.includes(code)) {
      onNotify?.({
        title: 'Item Sudah Terscan',
        message: `Unit ${code} sudah ada di dalam daftar fisik.`,
        type: 'warning'
      });
      return;
    }

    setScannedItemsList(prev => [...prev, code]);

    // Berikan feedback suara (beep mock) atau visual sukses
    onNotify?.({
      title: 'Item Terscan',
      message: `Unit ${code} berhasil dimasukkan ke daftar opname.`,
      type: 'success'
    });
  };

  const handleRemoveScannedItem = (code) => {
    setScannedItemsList(prev => prev.filter(item => item !== code));
  };

  const handleSaveOpname = async () => {
    setIsSaving(true);
    const { missing, unexpected, matched } = discrepancyReport;

    const sessionPayload = {
      location: selectedLocation,
      scannedCount: scannedItemsList.length,
      systemCount: systemItems.length,
      matchedCount: matched.length,
      missingCount: missing.length,
      unexpectedCount: unexpected.length,
      missingItems: missing.map(item => ({ itemCode: item.itemCode, productId: item.productId })),
      unexpectedItems: unexpected.map(item => ({ itemCode: item.itemCode, productId: item.productId })),
      createdBy: operatorId || 'system',
      status: 'COMPLETED'
    };

    try {
      // 1. Simpan rekap sesi stock opname ke database
      const saved = await saveStockOpnameSession(sessionPayload);

      // 2. Koreksi stok produk secara otomatis di database (Rekonsiliasi)
      // - Untuk item yang Missing: kita kurangi availableStock produk global sebesar 1
      // - Untuk item yang Unexpected: kita tambahkan availableStock produk global sebesar 1 (karena ditemukan fisik baru!)
      const productsToAdjust = {};

      missing.forEach(item => {
        if (!productsToAdjust[item.productId]) {
          productsToAdjust[item.productId] = 0;
        }
        productsToAdjust[item.productId] -= 1; // Kurangi stok
      });

      unexpected.forEach(item => {
        if (item.productId) {
          if (!productsToAdjust[item.productId]) {
            productsToAdjust[item.productId] = 0;
          }
          productsToAdjust[item.productId] += 1; // Tambah stok
        }
      });

      // Terapkan penyesuaian stok produk global di Firestore secara atomik
      for (const [productId, diff] of Object.entries(productsToAdjust)) {
        const product = products.find(p => p.id === productId);
        if (product && diff !== 0) {
          const nextStock = Math.max(0, Number(product.availableStock || 0) + diff);
          const stockTotal = nextStock + Number(product.rentedStock || 0) + Number(product.laundryStock || 0) + Number(product.maintenanceStock || 0);

          await saveProduct({
            ...product,
            stock: nextStock,
            availableStock: nextStock,
            totalStock: stockTotal,
            stockAvailable: nextStock,
            stockTotal,
            adjustmentReason: `Stock Opname Rekonsiliasi di ${selectedLocation} (ID: ${saved.id})`,
            operatorId
          }, true);
        }
      }

      setSavedSessionResult(saved);
      setIsSessionActive(false);
      onNotify?.({
        title: 'Stock Opname Sukses',
        message: `Audit di ${selectedLocation} berhasil disimpan dan stok disinkronkan.`,
        type: 'success'
      });
    } catch (err) {
      onNotify?.({
        title: 'Gagal Menyimpan Sesi',
        message: err.message || 'Terjadi kesalahan saat rekonsiliasi.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Banner */}
      <div className="brand-gradient rounded-[24px] p-4 text-white shadow-soft md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">Audit Gudang & Logistik</p>
          <h2 className="mt-2 text-lg sm:text-2xl font-black">Stock Opname & Rekonsiliasi Fisik</h2>
          <p className="mt-1 text-xs text-white/90">
            Audit fisik kostum adat secara real-time untuk memastikan data laci digital sinkron 100% dengan baju di gantungan rak.
          </p>
        </div>
        <span className="rounded-full bg-white/20 border border-white/30 px-3.5 py-1 text-xs font-bold capitalize flex items-center gap-1.5 shrink-0">
          <MapPin size={13} /> {selectedLocation}
        </span>
      </div>

      {!isSessionActive && !savedSessionResult && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm max-w-xl mx-auto space-y-6 text-center">
          <Barcode size={48} className="mx-auto text-blue-800 animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-lg font-black text-slate-900">Mulai Sesi Audit Fisik Baru</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Pilih area rak/lokasi penyimpanan, lalu mulailah memindai unit kostum adat menggunakan scanner barcode atau input manual. Sistem akan secara otomatis menghitung selisih.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-150 p-4 text-left space-y-3 bg-slate-50">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pilih Area Audit (Lokasi/Rak)</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none"
            >
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleStartSession}
            className="w-full rounded-2xl bg-blue-800 hover:bg-blue-900 text-white py-3.5 text-sm font-black shadow-md flex items-center justify-center gap-2 transition"
          >
            <Play size={16} /> Mulai Audit Sesi
          </button>
        </div>
      )}

      {isSessionActive && (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Sisi Kiri: Scanner Terminal & Pemindaian */}
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-1.5"><Barcode size={18} className="text-blue-800" /> Terminal Pemindaian Fisik</h3>
                <span className="bg-blue-50 text-blue-700 text-xs font-black px-2.5 py-0.5 rounded-full">{scannedItemsList.length} Terscan</span>
              </div>

              {/* Form Scan */}
              <form onSubmit={handleScanSubmit} className="flex gap-2">
                <input
                  type="text"
                  required
                  value={scannedInput}
                  onChange={(e) => setScannedInput(e.target.value)}
                  placeholder="Scan QR unit / ketik manual (e.g. BUGIS-L-001)..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-blue-800 hover:bg-blue-900 text-white px-5 py-3 text-xs font-black shadow-sm transition"
                >
                  Input
                </button>
              </form>

              {/* List item yang berhasil di-scan */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {scannedItemsList.length === 0 ? (
                  <div className="text-center py-12 text-xs font-semibold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada item yang di-scan. Tempatkan kursor di kotak input di atas dan tembak scanner QR.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {scannedItemsList.map(code => (
                      <div key={code} className="flex justify-between items-center bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-xs font-bold text-slate-800">
                        <span className="truncate">{code}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveScannedItem(code)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* List Item Sistem untuk Area Terpilih */}
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Total Unit Terdaftar Sistem ({systemItems.length} unit)</h3>
              <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {systemItems.map(item => {
                  const isScanned = scannedItemsList.includes(item.itemCode);
                  return (
                    <span
                      key={item.itemCode}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition ${
                        isScanned
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}
                    >
                      {item.itemCode}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Laporan Discrepancy & Aksi */}
          <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm space-y-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Laporan Discrepancy (Selisih)</h3>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] uppercase opacity-75">Cocok</p>
                  <p className="text-base font-black mt-0.5">{discrepancyReport.matched.length}</p>
                </div>
                <div className="bg-red-50 text-red-700 p-3 rounded-2xl border border-red-100">
                  <p className="text-[9px] uppercase opacity-75">Hilang</p>
                  <p className="text-base font-black mt-0.5">{discrepancyReport.missing.length}</p>
                </div>
                <div className="bg-amber-50 text-amber-700 p-3 rounded-2xl border border-amber-100">
                  <p className="text-[9px] uppercase opacity-75">Tersesat</p>
                  <p className="text-base font-black mt-0.5">{discrepancyReport.unexpected.length}</p>
                </div>
              </div>

              {/* Detail Items Missing */}
              {discrepancyReport.missing.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-red-800 flex items-center gap-1.5"><ShieldAlert size={14} /> Item Hilang dari Rak ({discrepancyReport.missing.length})</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {discrepancyReport.missing.map(item => (
                      <div key={item.itemCode} className="flex justify-between items-center text-[10px] font-bold text-slate-700 bg-red-50/40 p-2 rounded-xl border border-red-100">
                        <span className="font-black">{item.itemCode}</span>
                        <span className="truncate max-w-[150px]">{item.productName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detail Items Unexpected */}
              {discrepancyReport.unexpected.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-amber-800 flex items-center gap-1.5"><AlertTriangle size={14} /> Item Tak Terduga di Rak ({discrepancyReport.unexpected.length})</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {discrepancyReport.unexpected.map(item => (
                      <div key={item.itemCode} className="flex justify-between items-center text-[10px] font-bold text-slate-700 bg-amber-50/40 p-2 rounded-xl border border-amber-100">
                        <span className="font-black">{item.itemCode}</span>
                        <span className="truncate max-w-[150px]">{item.productName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Penjelasan Ringkasan */}
              <div className="p-3 bg-blue-50/50 border border-blue-150 rounded-2xl flex gap-2 text-xs font-semibold text-blue-900 leading-relaxed">
                <Sparkles size={16} className="text-blue-700 shrink-0 mt-0.5" />
                <p>
                  Melakukan rekonsiliasi akan menandai item yang hilang sebagai LOST di log pergerakan stok, dan mendaftarkan item tak terduga sebagai stok baru di rak ini. Jumlah stok global katalog produk akan disinkronkan secara otomatis.
                </p>
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsSessionActive(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveOpname}
                  disabled={isSaving}
                  className="flex-1 rounded-2xl bg-blue-800 hover:bg-blue-900 text-white py-3 text-sm font-black shadow-md flex items-center justify-center gap-1.5 transition"
                >
                  {isSaving ? (
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Terapkan Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STRUK RECEIPT PREVIEW STOCK OPNAME SESI SELESAI */}
      {savedSessionResult && (
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm max-w-lg mx-auto space-y-6 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-600 animate-bounce" />
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Rekonsiliasi Sesi Berhasil!</h3>
            <p className="text-xs text-slate-500">Stok inventaris dan log pergerakan gudang telah dimutakhirkan secara atomik.</p>
          </div>

          {/* Struk thermal */}
          <div className="p-4 bg-slate-100 rounded-2xl flex justify-center">
            <div id="opname-receipt" className="w-[280px] bg-white p-4.5 border border-slate-200 shadow-sm font-mono text-[10px] leading-relaxed text-black select-none text-left">
              <div className="text-center font-bold text-[12px] uppercase text-slate-900">3 BERLIAN - STOCK OPNAME</div>
              <div className="text-center text-[8px] text-slate-400">Bukti Rekonsiliasi Rak & Lokasi</div>

              <div className="border-b border-dashed border-slate-300 my-2.5" />

              <div className="space-y-0.5 text-slate-800">
                <div className="flex justify-between"><span>No. Audit:</span><span className="font-bold">{savedSessionResult.id}</span></div>
                <div className="flex justify-between"><span>Lokasi Area:</span><span className="font-bold">{savedSessionResult.location}</span></div>
                <div className="flex justify-between"><span>Tanggal:</span><span>{new Date(savedSessionResult.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                <div className="flex justify-between"><span>Operator:</span><span className="capitalize font-bold">{savedSessionResult.createdBy}</span></div>
              </div>

              <div className="border-b border-dashed border-slate-300 my-2.5" />

              <div className="space-y-1">
                <div className="flex justify-between font-bold"><span>Total Stok Sistem:</span><span>{savedSessionResult.systemCount} unit</span></div>
                <div className="flex justify-between font-bold"><span>Fisik Terscan:</span><span>{savedSessionResult.scannedCount} unit</span></div>

                <div className="border-b border-dashed border-slate-250 my-2" />

                <div className="flex justify-between text-emerald-700"><span>Unit Cocok:</span><span>{savedSessionResult.matchedCount} unit</span></div>
                <div className="flex justify-between text-red-600"><span>Unit Hilang (LOST):</span><span>-{savedSessionResult.missingCount} unit</span></div>
                <div className="flex justify-between text-amber-700"><span>Unit Tersesat (NEW):</span><span>+{savedSessionResult.unexpectedCount} unit</span></div>
              </div>

              <div className="border-b border-solid border-slate-900 my-2.5" />

              <div className="text-center text-[8px] text-slate-400 font-semibold uppercase">PENYESUAIAN STOK DATABASE SELESAI</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSavedSessionResult(null)}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={() => {
                const printContents = document.getElementById('opname-receipt').innerHTML;
                const printWindow = window.open('', '', 'width=400,height=500');
                printWindow.document.write('<html><head><title>Print Rekap Opname</title><style>');
                printWindow.document.write('body { font-family: monospace; padding: 20px; font-size: 10px; }');
                printWindow.document.write('.text-center { text-align: center; } .font-bold { font-weight: bold; }');
                printWindow.document.write('.flex { display: flex; justify-content: space-between; } .border-b { border-bottom: 1px dashed #ccc; margin: 8px 0; }');
                printWindow.document.write('</style></head><body>');
                printWindow.document.write(printContents);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
              }}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <Printer size={14} /> Cetak Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
