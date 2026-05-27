import { mkdirSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { spawn } from 'node:child_process';

const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const appUrl = process.env.UI_AUDIT_URL || 'http://127.0.0.1:5174';
const debugPort = Number(process.env.UI_AUDIT_DEBUG_PORT || 9223);
const outDir = '.sixth';

mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getJson = (url) => new Promise((resolve, reject) => {
  const req = request(url, res => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
  req.on('error', reject);
  req.end();
});

const waitForDebug = async () => {
  for (let index = 0; index < 40; index += 1) {
    try {
      return await getJson(`http://127.0.0.1:${debugPort}/json/version`);
    } catch {
      await sleep(250);
    }
  }
  throw new Error('Chrome remote debugging tidak siap.');
};

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${process.cwd()}\\${outDir}\\chrome-profile`,
  '--disable-gpu',
  '--disable-extensions',
  '--no-first-run',
  '--no-default-browser-check',
  appUrl
], { stdio: 'ignore' });

await waitForDebug();
let targets = await getJson(`http://127.0.0.1:${debugPort}/json`);
let pageTarget = targets.find(target => target.type === 'page' && target.url.startsWith(appUrl));
if (!pageTarget) {
  await getJson(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(appUrl)}`);
  targets = await getJson(`http://127.0.0.1:${debugPort}/json`);
  pageTarget = targets.find(target => target.type === 'page' && target.url.startsWith(appUrl)) || targets.find(target => target.type === 'page');
}
if (!pageTarget?.webSocketDebuggerUrl) {
  throw new Error('Target page Chrome tidak ditemukan.');
}
const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

let nextId = 1;
const pending = new Map();

ws.addEventListener('message', event => {
  const payload = JSON.parse(event.data);
  if (payload.id && pending.has(payload.id)) {
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) reject(new Error(payload.error.message));
    else resolve(payload.result);
  }
});

await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));

const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = nextId;
  nextId += 1;
  const timeout = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`CDP timeout: ${method}`));
  }, 15000);
  pending.set(id, {
    resolve: (value) => {
      clearTimeout(timeout);
      resolve(value);
    },
    reject: (error) => {
      clearTimeout(timeout);
      reject(error);
    }
  });
  ws.send(JSON.stringify({ id, method, params }));
});

const evaluate = async (expression) => {
  const result = await cdp('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result.result?.value;
};

const screenshot = async (name) => {
  if (process.env.UI_AUDIT_NO_SCREENSHOTS === '1') {
    return `screenshot skipped: ${name}`;
  }
  try {
    const shot = await cdp('Page.captureScreenshot', { format: 'png' });
    const path = `${outDir}/${name}.png`;
    writeFileSync(path, Buffer.from(shot.data, 'base64'));
    return path;
  } catch (error) {
    return `screenshot failed: ${name}: ${error.message}`;
  }
};

const captureLayoutCheck = async (label) => evaluate(`
  (() => {
    const documentElement = document.documentElement;
    const body = document.body;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollWidth = Math.max(documentElement.scrollWidth, body?.scrollWidth || 0);
    const scrollHeight = Math.max(documentElement.scrollHeight, body?.scrollHeight || 0);
    return {
      label: ${JSON.stringify(label)},
      viewportWidth,
      viewportHeight,
      scrollWidth,
      scrollHeight,
      horizontalOverflow: scrollWidth > viewportWidth + 4
    };
  })()
`);

const waitForText = async (pattern, timeout = 15000) => {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const text = await evaluate('document.body.innerText');
    if (new RegExp(pattern, 'i').test(text || '')) return text;
    await sleep(500);
  }
  return evaluate('document.body.innerText');
};

const clickByText = async (text) => evaluate(`
  (() => {
    const target = [...document.querySelectorAll('button')].find(button => button.innerText.includes(${JSON.stringify(text)}));
    if (!target) return false;
    target.click();
    return true;
  })()
`);

const fillByPlaceholder = async (placeholder, value) => evaluate(`
  (() => {
    const input = [...document.querySelectorAll('input')].find(element => element.placeholder === ${JSON.stringify(placeholder)});
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()
`);

const audit = {
  url: appUrl,
  loginLoaded: false,
  initialized: false,
  loggedIn: false,
  layoutChecks: [],
  screens: [],
  notes: []
};

try {
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await evaluate(`window.location.href = ${JSON.stringify(appUrl)}`);
  await waitForText('Masuk ke Sistem|Sistem belum berhasil memuat data|Data akun masih kosong', 20000);
  audit.screens.push(await screenshot('ui-audit-login'));
  await sleep(14000);

  let bodyText = await evaluate('document.body.innerText');
  audit.loginLoaded = bodyText.includes('Masuk ke Sistem');
  audit.loggedIn = bodyText.includes('Ringkasan toko');

  if (!audit.loggedIn && bodyText.includes('Sistem belum berhasil memuat data')) {
    audit.notes.push('Firebase tidak selesai memuat data pada layar login.');
    const demoStarted = await clickByText('Gunakan Data Contoh');
    if (demoStarted) {
      audit.notes.push('Mode demo lokal dipakai untuk melanjutkan uji login.');
      await sleep(1000);
      bodyText = await evaluate('document.body.innerText');
    }
  }

  if (!audit.loggedIn && bodyText.includes('Data akun masih kosong')) {
    audit.initialized = await clickByText('Siapkan Akun Awal');
    await sleep(5000);
    bodyText = await evaluate('document.body.innerText');
    audit.loggedIn = bodyText.includes('Ringkasan toko');
  }

  if (!audit.loggedIn && bodyText.includes('Username')) {
    await fillByPlaceholder('Masukkan username', 'admin');
    await fillByPlaceholder('Masukkan password', '12345');
    await clickByText('Masuk ke Sistem');
    bodyText = await waitForText('Ringkasan toko|Username atau password salah|Sistem belum berhasil', 15000);
    audit.loggedIn = bodyText.includes('Ringkasan toko');
  }

  audit.screens.push(await screenshot('ui-audit-after-login'));
  audit.layoutChecks.push(await captureLayoutCheck('desktop-after-login'));

  if (audit.loggedIn) {
    for (const pageName of ['Sewa', 'Kembali', 'Produk', 'Laporan']) {
      await clickByText(pageName);
      await sleep(1000);
      audit.screens.push(await screenshot(`ui-audit-${pageName.toLowerCase()}`));
      audit.layoutChecks.push(await captureLayoutCheck(`desktop-${pageName.toLowerCase()}`));
    }
  }

  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await sleep(800);
  audit.screens.push(await screenshot('ui-audit-mobile'));
  audit.layoutChecks.push(await captureLayoutCheck('mobile-390'));
  audit.finalText = await evaluate('document.body.innerText');
  const overflowLabels = audit.layoutChecks
    .filter(check => check.horizontalOverflow)
    .map(check => `${check.label} (${check.scrollWidth}/${check.viewportWidth})`);
  if (overflowLabels.length > 0) {
    audit.notes.push(`Horizontal overflow terdeteksi: ${overflowLabels.join(', ')}`);
  }
  audit.passed = overflowLabels.length === 0;
} finally {
  writeFileSync(`${outDir}/ui-audit-result.json`, JSON.stringify(audit, null, 2));
  ws.close();
  chrome.kill();
}

console.log(JSON.stringify(audit, null, 2));
