import { registerSW } from 'virtual:pwa-register';
import { isMock } from '../main/client';
import { startApp } from '../main';

import { loadAnalytics, loadFirebase, logEvent, setUserId, setUserProperties } from './firebase';
import printJS from 'print-js';
import type { Analytics } from 'firebase/analytics';

let analytics: Analytics | null = null;

async function initializeServer() {
  if (!import.meta.env.PROD || isMock) {
    (await import('./mockserver')).useMockServer();
  }
}

async function startAnalytics() {
  if (import.meta.env.PROD && import.meta.env.VITE_FIREBASE_ANALYTICS == 'true') {
    await loadFirebase();
    analytics = await loadAnalytics();
  }
}

startApp(async () => {
  try {
    await initializeServer();
    await startAnalytics();
  } finally {
    await registerSW({ immediate: true })(true);
  }
}, {
  async onAuthDestroy() {
    if (!analytics) return;
    setUserId!(analytics, '');
    setUserProperties!(analytics, {});
  },

  async onDownloadURL({ url, data, fileName }) {
    var link = document.createElement("a");
    link.download = fileName;

    if (data) {
      if (fileName.endsWith('.pdf')) {
        link.href = URL.createObjectURL(new Blob([data.buffer], { type: 'application/pdf' }));
      }
    } else if (url) {
      link.href = url;
    }

    link.click();
  },
  async onPrintPage({ url, data }) {
    if (data) {
      const blob = new Blob([data.buffer], { type: 'application/pdf' });
      printJS(URL.createObjectURL(blob));
    } else if (url) {
      printJS(url);
    }
    return false;
  },
  onLogEvent(name, params) {
    if (!analytics) return;

    logEvent!(analytics, name, params);
  },
  onReceiveStudentInfo({student, additionalInfo}) {
    if (!analytics) return;

    setUserId!(analytics, student.number);
    setUserProperties!(analytics, {
      gender: student.gender,
      religion: student.religion,
      nationality: student.nationality,
      income_group: student.parentInformation.incomeGroup,
      course: additionalInfo.course,
      year: additionalInfo.year
    });
  }
});
