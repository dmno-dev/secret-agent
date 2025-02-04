import https from 'https';

const req = https.request('https://localhost:8787/api/llm', {
  rejectUnauthorized: false,
  // agent: false
  method: 'post',
}, (res) => {
  console.log(res);
});

req.on('error', function(e) {
  console.log('problem with request: ' + e.message);
});

// write data to request body
req.write('data\n');
req.write('data\n');
req.end();