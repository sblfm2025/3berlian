import { useEffect, useRef, useState } from 'react';

const PWA_INSTALLED_KEY = 'pos-3berlian-pwa-installed';

const getDevicePlatform = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  return { isAndroid, isIOS };
};

const isPwaStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

export const usePwaInstall = (user, onNotify) => {
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => isPwaStandalone() || window.localStorage.getItem(PWA_INSTALLED_KEY) === 'true');
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() => (
    'Notification' in window ? window.Notification.permission : 'unsupported'
  ));
  const notificationPromptShownRef = useRef(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setIsAppInstalled(isPwaStandalone());
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setDeferredInstallPrompt(null);
      setIsAppInstalled(true);
      setPwaPrompt(null);
      onNotify({
        title: 'Aplikasi terpasang',
        message: '3 Berlian POS sudah siap dibuka dari layar utama.',
        type: 'success'
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onNotify]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => {
      if (isPwaStandalone()) {
        window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        setIsAppInstalled(true);
      }
    };

    updateDisplayMode();
    mediaQuery.addEventListener?.('change', updateDisplayMode);
    return () => mediaQuery.removeEventListener?.('change', updateDisplayMode);
  }, []);

  useEffect(() => {
    if (!user || notificationPromptShownRef.current || notificationPermission !== 'default') return undefined;

    notificationPromptShownRef.current = true;
    const timeout = window.setTimeout(() => setPwaPrompt('notification'), 1800);
    return () => window.clearTimeout(timeout);
  }, [notificationPermission, user]);

  const showInstallPrompt = () => {
    setPwaPrompt('install');
  };

  const showNotificationPermissionPrompt = () => {
    setPwaPrompt('notification');
  };

  const handleNotificationAction = (action) => {
    if (action === 'install-app') {
      showInstallPrompt();
      return;
    }

    if (action === 'enable-notifications') {
      showNotificationPermissionPrompt();
    }
  };

  const handleInstallApp = async () => {
    const platform = getDevicePlatform();

    if (isPwaStandalone()) {
      window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setIsAppInstalled(true);
      setPwaPrompt(null);
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      if (choiceResult?.outcome === 'accepted') {
        window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        setIsAppInstalled(true);
        setPwaPrompt(null);
      }
      return;
    }

    if (platform.isIOS) {
      setPwaPrompt('ios-install');
      return;
    }

    setPwaPrompt('manual-install');
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      onNotify({ title: 'Notifikasi tidak didukung', message: 'Browser ini belum mendukung notifikasi aplikasi.', type: 'warning' });
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission !== 'granted') return;

    try {
      const registration = await window.navigator.serviceWorker?.ready;
      await registration?.showNotification('Notifikasi 3 Berlian aktif', {
        body: 'Anda akan melihat pengingat penting dari aplikasi saat browser mengizinkan.',
        icon: '/app-logo-192.png',
        badge: '/app-logo-32.png',
        tag: '3berlian-notification-ready'
      });
    } catch {
      onNotify({ title: 'Notifikasi aktif', message: 'Izin notifikasi sudah diberikan.', type: 'success' });
    }

    setPwaPrompt(null);
  };

  return {
    deferredInstallPrompt,
    isAppInstalled,
    pwaPrompt,
    setPwaPrompt,
    notificationPermission,
    handleNotificationAction,
    handleInstallApp,
    handleEnableNotifications,
    getDevicePlatform
  };
};
