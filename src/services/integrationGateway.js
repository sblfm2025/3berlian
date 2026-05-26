const adapterRegistry = new Map();

export const INTEGRATION_STATUS = {
  READY: 'ready',
  NOT_CONFIGURED: 'not_configured',
  DISABLED: 'disabled'
};

export const integrationReadiness = {
  whatsapp: INTEGRATION_STATUS.NOT_CONFIGURED,
  printer: INTEGRATION_STATUS.NOT_CONFIGURED,
  paymentGateway: INTEGRATION_STATUS.NOT_CONFIGURED,
  accountingExport: INTEGRATION_STATUS.NOT_CONFIGURED
};

export const registerIntegrationAdapter = (name, adapter) => {
  if (!name || typeof name !== 'string') {
    throw new Error('Nama adapter integrasi wajib diisi.');
  }

  if (!adapter || typeof adapter !== 'object') {
    throw new Error(`Adapter ${name} harus berupa object.`);
  }

  adapterRegistry.set(name, adapter);
  return adapter;
};

export const getIntegrationAdapter = (name) => adapterRegistry.get(name) || null;

export const runIntegrationAction = async (name, action, payload = {}) => {
  const adapter = getIntegrationAdapter(name);

  if (!adapter || typeof adapter[action] !== 'function') {
    return {
      ok: false,
      skipped: true,
      reason: 'adapter_not_configured',
      integration: name,
      action
    };
  }

  return adapter[action](payload);
};

export const createNoopIntegrationAdapter = (label) => ({
  async send(payload = {}) {
    return {
      ok: false,
      skipped: true,
      reason: 'noop_adapter',
      integration: label,
      payload
    };
  }
});
