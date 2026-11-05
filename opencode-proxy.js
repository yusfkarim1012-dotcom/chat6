const http = require('http');

const UPSTREAM_HOST = process.env.OPENSECODE_HOST || '127.0.0.1';
const UPSTREAM_PORT = Number(process.env.OPENSECODE_PORT) || 8080;
const PASSWORD = process.env.OPENSECODE_PASSWORD;
const LISTEN_PORT = Number(process.env.PROXY_PORT) || 8081;

if (!PASSWORD) {
  console.error('OPENSECODE_PASSWORD is required');
  process.exit(1);
}

const auth = Buffer.from('opencode:' + PASSWORD).toString('base64');

const proxy = http.createServer((req, res) => {
  req.headers['authorization'] = 'Basic ' + auth;

  const options = {
    hostname: UPSTREAM_HOST,
    port: UPSTREAM_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const up = http.request(options, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers);
    upRes.pipe(res);
  });
  up.on('error', (e) => {
    res.writeHead(502);
    res.end('proxy error: ' + e.message);
  });
  req.pipe(up);
});

proxy.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log('proxy listening on 0.0.0.0:' + LISTEN_PORT);
});