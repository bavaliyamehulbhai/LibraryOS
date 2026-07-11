const fs = require('fs');
const path = require('path');

const source = 'C:\\Users\\Mehul\\.gemini\\antigravity-ide\\brain\\99f5100b-a161-439e-9e90-7fa3e13ba5aa\\libraryos_logo_1783601348507.png';
const dest1 = path.join(__dirname, '..', '..', 'client', 'public', 'pwa-192x192.png');
const dest2 = path.join(__dirname, '..', '..', 'client', 'public', 'pwa-512x512.png');

fs.copyFileSync(source, dest1);
fs.copyFileSync(source, dest2);

console.log('Icons copied successfully to client/public/');
