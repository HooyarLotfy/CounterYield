if (typeof document !== 'undefined') {
  if (document.body) {
    document.body.style.backgroundColor = '#131313';
    document.body.style.margin = '0';
  }
  const rootEl = document.getElementById('root');
  if (rootEl) {
    rootEl.style.backgroundColor = '#131313';
    rootEl.style.height = '100%';
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('CounterYield Global Error:', event);
    const box = document.createElement('div');
    box.id = 'cy-global-error-banner';
    box.style.cssText =
      'position:fixed;top:0;left:0;right:0;bottom:0;background:#131313;color:#ff5f52;padding:24px;font-family:monospace;font-size:13px;z-index:999999;overflow:auto;';
    box.innerHTML =
      '<h3 style="color:#9FE825;margin-top:0;">⚠️ CounterYield Startup Diagnostic</h3>' +
      '<p style="color:#ffffff;font-size:15px;font-weight:bold;">' +
      (event.message || 'Error occurred during startup') +
      '</p>' +
      '<pre style="color:rgba(255,255,255,0.7);background:#1f1f1f;padding:12px;border-radius:8px;overflow:auto;white-space:pre-wrap;">' +
      (event.filename ? event.filename + ':' + event.lineno + ':' + event.colno + '\n\n' : '') +
      (event.error && event.error.stack ? event.error.stack : '') +
      '</pre>';
    document.body.appendChild(box);
  });
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);

