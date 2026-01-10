// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqYXF7pmVrGlb8idNsnDo_OxU2g8Xef7E",
  authDomain: "genzcoderss.firebaseapp.com",
  projectId: "genzcoderss",
  storageBucket: "genzcoderss.firebasestorage.app",
  messagingSenderId: "1018530595676",
  appId: "1:1018530595676:web:91b88638d1ac314d8f3799",
  measurementId: "G-115G05R73T"
};

// Initialize Firebase
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export let analytics = null;

const debugMode = Boolean(import.meta?.env?.DEV);

const pendingEvents = [];

function flushPendingEvents() {
  if (!analytics) return;

  while (pendingEvents.length) {
    const next = pendingEvents.shift();
    if (!next) continue;
    logEvent(analytics, next.name, next.params);
  }
}

export function trackEvent(name, params) {
  const nextParams = debugMode ? { ...(params ?? {}), debug_mode: true } : params;

  if (analytics) {
    logEvent(analytics, name, nextParams);
    return;
  }

  pendingEvents.push({ name, params: nextParams });
}

export function trackPageView(pathname) {
  trackEvent('page_view', { page_path: pathname });
}

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        flushPendingEvents();
      }
    })
    .catch(() => {
      // ignore
    });
}