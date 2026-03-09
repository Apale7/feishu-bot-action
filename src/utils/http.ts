import * as https from 'https';
import * as http from 'http';

export interface HttpResponse {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: any;
}

export interface RequestOptions {
  hostname: string;
  port: number;
  path: string;
  method: string;
  headers: Record<string, string | number>;
}

export function httpRequest(options: RequestOptions, body?: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode || 0, headers: res.headers, body: response });
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

export function buildOptions(
  url: string,
  method: string,
  headers?: Record<string, string | number>,
  body?: string
): RequestOptions {
  const parsedUrl = new URL(url);
  const options: RequestOptions = {
    hostname: parsedUrl.hostname,
    port: parseInt(parsedUrl.port) || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    method: method,
    headers: headers || {}
  };

  if (body) {
    options.headers['Content-Length'] = Buffer.byteLength(body);
  }

  return options;
}