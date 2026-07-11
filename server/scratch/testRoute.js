const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/digital-library/6a4d06b7020858c413737a7b/save',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, '\nBODY:', data));
});

req.on('error', console.error);
req.end();
