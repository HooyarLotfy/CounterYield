const os = require('os');
const ifaces = os.networkInterfaces();
let selected = '127.0.0.1';

// Prefer active Wi-Fi or Ethernet on typical private LAN ranges
for (const name in ifaces) {
  for (const item of ifaces[name]) {
    if (item.family === 'IPv4' && !item.internal) {
      if (item.address.startsWith('192.168.') || item.address.startsWith('10.') || item.address.startsWith('172.')) {
        if (!name.toLowerCase().includes('vmware') && !name.toLowerCase().includes('virtualbox')) {
          selected = item.address;
          break;
        }
      }
    }
  }
}

console.log(selected);
