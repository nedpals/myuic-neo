import { registerSW } from 'virtual:pwa-register';
import { isMock } from './client';
import { startApp } from './main.common';

import printJS from 'print-js';
import { analytics } from './firebase';
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';

async function initializeServer() {
  if (!import.meta.env.PROD || isMock) {
    (await import('./mockserver')).useMockServer();
  }
}

startApp(async () => {
  try {
    await initializeServer();
  } finally {
    await registerSW({ immediate: true })(true);
  }
}, {
  async onAuthDestroy() {
    if (!import.meta.env.PROD) return;
    setUserId(analytics, '');
    setUserProperties(analytics, {});
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
    if (!import.meta.env.PROD) return;

    logEvent(analytics, name, params);
  },
  onReceiveStudentInfo({student, additionalInfo}) {
    if (!import.meta.env.PROD) return;

    setUserId(analytics, student.number);
    setUserProperties(analytics, { 
      gender: student.gender, 
      religion: student.religion, 
      nationality: student.nationality,
      income_group: student.parentInformation.incomeGroup,
      course: additionalInfo.course,
      year: additionalInfo.year
    });
  }
});
