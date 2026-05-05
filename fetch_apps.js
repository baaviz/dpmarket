const fs = require('fs');
const https = require('https');

https.get('https://doha-plus.com/Apps', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('scratch_apps.html', data);
    console.log('HTML Length:', data.length);
    console.log('Sample:\n', data.substring(0, 1000));
  });
}).on('error', (err) => {
  console.error(err);
});
