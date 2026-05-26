import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../services/firebase';
import { seedInitialData } from '../repositories/userRepository';
import { initialAppUsers, initialProducts } from '../constants/seedData';

const APP_SESSION_KEY = 'pos-3berlian-session';

const getStoredUserSession = () => {
  try {
    const stored = window.localStorage.getItem(APP_SESSION_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed?.username || !parsed?.role) return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(APP_SESSION_KEY);
    return null;
  }
};

const saveUserSession = (nextUser) => {
  const sessionUser = {
    id: nextUser.id,
    name: nextUser.name,
    username: nextUser.username,
    role: nextUser.role,
    email: nextUser.email
  };
  window.localStorage.setItem(APP_SESSION_KEY, JSON.stringify(sessionUser));
};

export const useAppAuth = (onNotify) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(() => getStoredUserSession());
  const [isLoginDataLoaded, setIsLoginDataLoaded] = useState(false);
  const [loginLoadingMessage, setLoginLoadingMessage] = useState('Menyiapkan halaman login...');
  const [dataLoadError, setDataLoadError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Menyiapkan sesi aplikasi (Firebase Auth)
  useEffect(() => {
    if (!auth) {
      window.setTimeout(() => {
        setDataLoadError('Sesi masuk belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }, 0);
      return undefined;
    }

    const authTimeout = window.setTimeout(() => {
      setDataLoadError('Koneksi masuk terlalu lama. Pastikan internet stabil, lalu coba lagi.');
      setIsLoginDataLoaded(true);
    }, 12000);

    const initAuth = async () => {
      try {
        setLoginLoadingMessage('Menyiapkan sesi kasir...');
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth error', err);
        setDataLoadError('Gagal menyiapkan sesi masuk. Periksa koneksi internet lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) window.clearTimeout(authTimeout);
      setFirebaseUser(nextUser);
    });

    return () => {
      window.clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (foundUser) => {
    saveUserSession(foundUser);
    setUser(foundUser);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(APP_SESSION_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  const handleStartDemoMode = (setupDemoData) => {
    setDataLoadError('');
    setIsLoginDataLoaded(true);
    setIsDemoMode(true);
    setupDemoData();
  };

  const handleSeedInit = async () => {
    try {
      await seedInitialData({ users: initialAppUsers, products: initialProducts });
      onNotify({ title: 'Sistem siap', message: 'Akun awal dan data produk berhasil diinisialisasi.', type: 'success' });
    } catch (err) {
      console.error(err);
      onNotify({ title: 'Inisialisasi gagal', message: 'Gagal menyiapkan data awal.', type: 'error' });
    }
  };

  return {
    firebaseUser,
    user,
    setUser,
    isLoginDataLoaded,
    setIsLoginDataLoaded,
    loginLoadingMessage,
    setLoginLoadingMessage,
    dataLoadError,
    setDataLoadError,
    isDemoMode,
    setIsDemoMode,
    handleLoginSuccess,
    handleLogout,
    handleStartDemoMode,
    handleSeedInit
  };
};
