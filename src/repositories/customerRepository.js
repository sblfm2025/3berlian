import { setDoc } from 'firebase/firestore';
import { dataDoc } from './baseRepository';

/**
 * Memperbarui profil pelanggan di Firestore.
 */
export const updateCustomerProfile = async (customer) => {
  const measurement = customer.measurement || {};
  const payload = {
    address: customer.address || '',
    note: customer.note || '',
    riskNote: customer.riskNote || '',
    identityType: customer.identityType || 'KTP',
    identityNumber: customer.identityNumber || '',
    depositAmount: Number(customer.depositAmount || 0),
    isBlocked: Boolean(customer.isBlocked),
    deleted: Boolean(customer.deleted),
    deletedAt: customer.deletedAt || null,
    measurement: {
      heightCm: Number(measurement.heightCm || 0),
      weightKg: Number(measurement.weightKg || 0),
      chestCm: Number(measurement.chestCm || 0),
      waistCm: Number(measurement.waistCm || 0),
      hipCm: Number(measurement.hipCm || 0),
      shoulderCm: Number(measurement.shoulderCm || 0),
      headCm: Number(measurement.headCm || 0),
      shoeSize: String(measurement.shoeSize || '').trim(),
      preferredSize: String(measurement.preferredSize || '').trim(),
      notes: String(measurement.notes || '').trim()
    }
  };

  if (customer.name) payload.name = String(customer.name).trim();
  if (customer.phone) payload.phone = String(customer.phone).trim();

  await setDoc(dataDoc('customers', customer.id), payload, { merge: true });
};
