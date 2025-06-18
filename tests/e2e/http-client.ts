import * as http from 'http';

export interface HttpResponse {
  statusCode: number;
  headers: http.IncomingHttpHeaders;
  body: string;
  json(): any;
}

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export class HttpClient {
  private host: string;
  private port: number;

  constructor(host: string = 'localhost', port: number = 3000) {
    this.host = host;
    this.port = port;
  }

  async request(path: string, options: RequestOptions = {}): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      const { method = 'GET', headers = {}, body } = options;
      
      const requestOptions: http.RequestOptions = {
        hostname: this.host,
        port: this.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const response: HttpResponse = {
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
            json() {
              try {
                return JSON.parse(data);
              } catch {
                return null;
              }
            }
          };
          resolve(response);
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(typeof body === 'string' ? body : JSON.stringify(body));
      }

      req.end();
    });
  }

  async get(path: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(path, { method: 'GET', headers });
  }

  async post(path: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(path, { method: 'POST', body, headers });
  }

  async put(path: string, body?: any, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(path, { method: 'PUT', body, headers });
  }

  async delete(path: string, headers?: Record<string, string>): Promise<HttpResponse> {
    return this.request(path, { method: 'DELETE', headers });
  }
}