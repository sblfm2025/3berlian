import { useEffect } from 'react';

import { captureOperationalError, capturePerformanceMetric } from '../utils/monitoring';

export const useAppMonitoring = () => {
  useEffect(() => {
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const handleRuntimeError = (event) => {
      captureOperationalError('window.error', event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    };

    const handleUnhandledRejection = (event) => {
      captureOperationalError('window.unhandledrejection', event.reason);
    };

    window.addEventListener('error', handleRuntimeError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    capturePerformanceMetric('app.monitoring.ready', Math.round(finishedAt - startedAt));

    return () => {
      window.removeEventListener('error', handleRuntimeError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};
