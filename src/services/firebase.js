import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let app;
let auth;
let db;
let appId = 'sanggar-seni-3-berlian';

try {
  const fallbackFirebaseConfig = {
    apiKey: 'AIzaSyDkZ60CHecXzKq6xViz1yjyojFULv7o6A4',
    authDomain: 'berlian-bcd07.firebaseapp.com',
    databaseURL: 'https://berlian-bcd07-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'berlian-bcd07',
    storageBucket: 'berlian-bcd07.firebasestorage.app',
    messagingSenderId: '756325845365',
    appId: '1:756325845365:web:eda0fc95dd878133412b3c'
  };

  const firebaseConfig = typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0
    ? JSON.parse(__firebase_config)
    : fallbackFirebaseConfig;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : appId;
} catch (error) {
  console.error('Firebase Initialization Error:', error);
}

export { app, appId, auth, db };
