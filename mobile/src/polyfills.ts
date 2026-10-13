/**
 * Global Polyfills for CounterYield Mobile
 * Must be imported at the very top of index.js before any other modules.
 */

// 1. Polyfill crypto and crypto.getRandomValues for Hermes / React Native
if (typeof globalThis.crypto === 'undefined') {
  (globalThis as any).crypto = {};
}

if (typeof globalThis.crypto.getRandomValues !== 'function') {
  (globalThis.crypto as any).getRandomValues = function getRandomValues<
    T extends ArrayBufferView | null
  >(array: T): T {
    if (!array) return array;
    const uint8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (let i = 0; i < uint8.length; i++) {
      uint8[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

if (typeof (global as any).crypto === 'undefined') {
  (global as any).crypto = globalThis.crypto;
}

// 2. Polyfill btoa and atob for Hermes
const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

if (typeof globalThis.btoa === 'undefined') {
  (globalThis as any).btoa = function (input: string): string {
    const str = String(input);
    let output = '';
    for (
      let block = 0, charCode, i = 0, map = b64chars;
      str.charAt(i | 0) || ((map = '='), i % 1);
      output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))
    ) {
      charCode = str.charCodeAt((i += 3 / 4));
      if (charCode > 0xff) {
        throw new Error('btoa failed: The string contains characters outside of the Latin1 range.');
      }
      block = (block << 8) | charCode;
    }
    return output;
  };
}

if (typeof globalThis.atob === 'undefined') {
  (globalThis as any).atob = function (input: string): string {
    const str = String(input).replace(/[=]+$/, '');
    if (str.length % 4 === 1) {
      throw new Error('atob failed: The string is not correctly encoded.');
    }
    let output = '';
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = b64chars.indexOf(buffer);
    }
    return output;
  };
}

// 3. Web document styling (prevent white flash on mobile web)
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
