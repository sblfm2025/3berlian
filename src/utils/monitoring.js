const STORAGE_KEY = 'sodara_monitoring_events';
const MAX_STORED_EVENTS = 50;

const canUseStorage = () => typeof window !== 'undefined' && Boolean(window.localStorage);

const toPlainValue = (value) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack ? value.stack.slice(0, 1200) : ''
    };
  }

  if (typeof value === 'object' && value !== null) {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return String(value);
    }
  }

  return value;
};

const readStoredEvents = () => {
  if (!canUseStorage()) return [];

  try {
    const storedEvents = window.localStorage.getItem(STORAGE_KEY);
    return storedEvents ? JSON.parse(storedEvents) : [];
  } catch {
    return [];
  }
};

const writeStoredEvent = (event) => {
  if (!canUseStorage()) return;

  try {
    const nextEvents = [event, ...readStoredEvents()].slice(0, MAX_STORED_EVENTS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
  } catch {
    // Monitoring must never interrupt the main app flow.
  }
};

export const captureOperationalError = (source, error, context = {}) => {
  const event = {
    type: 'error',
    source,
    error: toPlainValue(error),
    context: toPlainValue(context),
    capturedAt: new Date().toISOString()
  };

  console.error(`[monitoring:${source}]`, event);
  writeStoredEvent(event);

  return event;
};

export const capturePerformanceMetric = (name, value, context = {}) => {
  const event = {
    type: 'metric',
    name,
    value,
    context: toPlainValue(context),
    capturedAt: new Date().toISOString()
  };

  console.info(`[monitoring:${name}]`, event);
  writeStoredEvent(event);

  return event;
};

export const getMonitoringSnapshot = () => ({
  capturedAt: new Date().toISOString(),
  events: readStoredEvents()
});
