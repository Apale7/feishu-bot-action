const https = require('https');

function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, headers: res.headers, body: response });
        } catch (e) {
          reject(new Error(`解析响应失败: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

function buildOptions(url, method, headers, body) {
  const parsedUrl = new URL(url);
  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    method: method,
    headers: headers || {}
  };

  if (body) {
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }

  return options;
}

module.exports = {
  httpRequest,
  buildOptions
};