import { setDoc } from 'firebase/firestore';
import { dataDoc } from './baseRepository';

/**
 * Memperbarui profil/data pengguna kasir di Firestore.
 */
export const updateAppUser = async (userData) => {
  await setDoc(dataDoc('users', userData.id), userData, { merge: true });
};

/**
 * Menginisialisasi data awal (seeding) untuk produk dan pengguna sistem.
 */
export const seedInitialData = async ({ users, products }) => {
  for (const user of users) {
    await setDoc(dataDoc('users', user.id), user);
  }

  for (const product of products) {
    await setDoc(dataDoc('products', product.id), product);
  }
};
