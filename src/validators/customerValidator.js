const phonePattern = /^[0-9+\-\s()]{7,20}$/;

/**
 * Validator untuk profil pelanggan.
 */
export const validateCustomerPayload = (customerData) => {
  const errors = [];
  const name = String(customerData.name || '').trim();
  const phone = String(customerData.phone || '').trim();
  const address = String(customerData.address || '').trim();

  if (!name) {
    errors.push('Nama pelanggan belum diisi.');
  }

  if (!phone) {
    errors.push('Nomor HP pelanggan belum diisi.');
  } else if (!phonePattern.test(phone)) {
    errors.push('Format nomor HP pelanggan tidak valid.');
  }

  if (!address) {
    errors.push('Alamat pelanggan belum diisi.');
  }

  // Validasi data ukuran tubuh jika ada
  if (customerData.measurement) {
    const m = customerData.measurement;
    const numericFields = {
      heightCm: 'Tinggi badan',
      weightKg: 'Berat badan',
      chestCm: 'Lingkar dada',
      waistCm: 'Lingkar pinggang',
      hipCm: 'Lingkar pinggul',
      shoulderCm: 'Lebar bahu',
      headCm: 'Lingkar kepala'
    };

    Object.entries(numericFields).forEach(([field, label]) => {
      if (m[field] !== undefined && m[field] !== null && m[field] !== '') {
        const val = Number(m[field]);
        if (isNaN(val)) {
          errors.push(`${label} harus berupa angka.`);
        } else if (val < 0) {
          errors.push(`${label} tidak boleh bernilai negatif.`);
        }
      }
    });
  }

  return {
    errors,
    isValid: errors.length === 0
  };
};
