export default function CustomerQuickForm({
  customerNameInput,
  setCustomerNameInput,
  setShowSuggestions,
  showSuggestions,
  filteredCustomers,
  applyCustomer,
  resetCustomer,
  customerMissingFields,
  favoriteCustomers,
  recentCustomers,
  customerPhoneInput,
  setCustomerPhoneInput,
  customerIdentityType,
  setCustomerIdentityType,
  customerIdentityNumber,
  setCustomerIdentityNumber,
  returnDateInput,
  setReturnDateInput,
  customerAddressInput,
  setCustomerAddressInput,
  customerNoteInput,
  setCustomerNoteInput,
  depositAmountInput,
  setDepositAmountInput,
  totalItems,
  formatDate,
  formatDateInput,
  formatNumberDot
}) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm sm:p-5 sm:rounded-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 sm:text-[11px] sm:tracking-[0.2em]">Pelanggan</p>
          <p className="mt-2 text-sm font-bold text-slate-900">{customerNameInput || 'Pelanggan belum diisi'}</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{totalItems} item</span>
      </div>

      <div className="mt-4 relative">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customerNameInput}
            onChange={event => { setCustomerNameInput(event.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ketik nama pelanggan *"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 sm:rounded-[18px] sm:px-4 sm:py-3"
          />
          {customerNameInput && (
            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                resetCustomer();
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 sm:rounded-[18px] sm:py-3"
            >
              Reset
            </button>
          )}
        </div>
        {showSuggestions && customerNameInput && filteredCustomers.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full rounded-[18px] border border-slate-200 bg-white shadow-2xl overflow-y-auto max-h-64">
            {filteredCustomers.map(customer => (
              <li
                key={customer.id}
                onMouseDown={() => applyCustomer(customer)}
                className="cursor-pointer px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-blue-50"
              >
                <p className="break-words text-sm font-bold text-slate-900">{customer.name}</p>
                <p className="mt-1 break-words text-[11px] leading-snug text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {customerMissingFields.length > 0 && (
        <div className="mt-3 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Peringatan data pelanggan</p>
          <p className="mt-2 text-sm font-semibold text-amber-900">
            Lengkapi: {customerMissingFields.join(', ')} sebelum pembayaran.
          </p>
        </div>
      )}

      {(favoriteCustomers.length > 0 || recentCustomers.length > 0) && (
        <div className="mt-3 rounded-[20px] border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan cepat</p>
              <p className="mt-1 text-xs text-slate-500">Pilih pelanggan favorit atau terakhir untuk mengisi data dengan cepat.</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {favoriteCustomers.map(customer => (
              <button
                key={`favorite-${customer.name}`}
                type="button"
                onMouseDown={() => applyCustomer(customer)}
                className="rounded-[18px] border border-blue-200 bg-white px-3 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                    <p className="text-[11px] text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">Favorit</span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-blue-700">{customer.count || 1} transaksi</p>
              </button>
            ))}
            {recentCustomers
              .filter(customer => !favoriteCustomers.some(item => item.name === customer.name))
              .map(customer => (
                <button
                  key={`recent-${customer.id}`}
                  type="button"
                  onMouseDown={() => applyCustomer(customer)}
                  className="rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                      <p className="text-[11px] text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">Terbaru</span>
                  </div>
                  {customer.lastRentDate && (
                    <p className="mt-2 text-[11px] font-bold text-blue-700">Terakhir sewa: {formatDate(customer.lastRentDate)}</p>
                  )}
                </button>
              ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="tel"
          placeholder="Telepon"
          value={customerPhoneInput}
          onChange={event => setCustomerPhoneInput(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 sm:rounded-[18px] sm:px-4 sm:py-3"
        />
        <select
          value={customerIdentityType}
          onChange={event => setCustomerIdentityType(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 sm:rounded-[18px] sm:px-4 sm:py-3"
        >
          <option value="KTP">KTP</option>
          <option value="SIM">SIM</option>
          <option value="Kartu Pelajar">Kartu Pelajar</option>
          <option value="Lainnya">Lainnya</option>
        </select>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Nomor identitas"
          value={customerIdentityNumber}
          onChange={event => setCustomerIdentityNumber(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 sm:rounded-[18px] sm:px-4 sm:py-3"
        />
        <input
          type="date"
          value={returnDateInput}
          min={formatDateInput()}
          onChange={event => setReturnDateInput(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 sm:rounded-[18px] sm:px-4 sm:py-3"
        />
      </div>
      <textarea
        placeholder="Alamat lengkap (opsional)"
        value={customerAddressInput}
        onChange={event => setCustomerAddressInput(event.target.value)}
        rows="2"
        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none sm:rounded-[18px] sm:px-4 sm:py-3"
      />
      <textarea
        placeholder="Catatan pelanggan / kebutuhan khusus"
        value={customerNoteInput}
        onChange={event => setCustomerNoteInput(event.target.value)}
        rows="2"
        className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none sm:rounded-[18px] sm:px-4 sm:py-3"
      />
      <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4">
        <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Deposit / Jaminan (opsional)</label>
        <input
          type="text"
          value={formatNumberDot(depositAmountInput)}
          onChange={event => setDepositAmountInput(event.target.value.replace(/[^0-9]/g, ''))}
          placeholder="Rp 0"
          className="mt-3 w-full rounded-[16px] border border-white bg-white px-4 py-3 text-sm font-black text-amber-900 focus:outline-none"
        />
        <p className="mt-2 text-[11px] text-amber-900/80">Deposit disimpan pada transaksi dan dapat dijadikan acuan pengembalian di tahap berikutnya.</p>
      </div>
    </div>
  );
}
