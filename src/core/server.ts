import * as http from 'http';
import * as url from 'url';
import { Request, Response, ServerOptions, MiddlewareFunction, InterceptorFunction, InterceptorContext } from '../types';
import { Router } from './router';
import { getControllerMetadata, getRouteMetadata, getAllInterceptors } from '../decorators';
import { processRequestParameters, RequestValidationError, handleValidationError } from '../validators/request-processor';

export class AquaServer {
  private server: http.Server;
  private router: Router;
  private options: ServerOptions;
  private globalInterceptors: InterceptorFunction[] = [];

  constructor(options: ServerOptions = {}) {
    this.options = {
      port: 3000,
      host: 'localhost',
      ...options
    };
    this.router = new Router();
    this.server = http.createServer(this.handleRequest.bind(this));
    
    if (this.options.middleware) {
      this.options.middleware.forEach(middleware => {
        this.router.use(middleware);
      });
    }
  }

  registerController(controllerClass: Function): void {
    const controllerMetadata = getControllerMetadata(controllerClass);
    const routes = getRouteMetadata(controllerClass);
    
    if (!controllerMetadata) {
      throw new Error(`Controller ${controllerClass.name} is not decorated with @Controller`);
    }

    routes.forEach(route => {
      const fullPath = controllerMetadata.prefix 
        ? `${controllerMetadata.prefix}${route.path}`
        : route.path;
      
      const handler = (controllerClass as unknown as Record<string, unknown>)[route.handler];
      if (!handler || typeof handler !== 'function') {
        throw new Error(`Handler ${route.handler} not found in controller ${controllerClass.name}`);
      }

      const wrappedHandler = this.createInterceptorHandler(
        handler.bind(controllerClass),
        controllerClass,
        route.handler
      );

      this.router.addRoute(
        route.method,
        fullPath,
        wrappedHandler,
        route.middleware || []
      );
    });
  }

  use(middleware: MiddlewareFunction): void {
    this.router.use(middleware);
  }

  useInterceptor(interceptor: InterceptorFunction): void {
    this.globalInterceptors.push(interceptor);
  }

  private createInterceptorHandler(
    originalHandler: Function,
    controllerClass: Function,
    methodName: string
  ) {
    return async (request: Request, response: Response) => {
      try {
        // Process validation for request parameters
        const args = processRequestParameters(controllerClass, methodName, request);
        
        const controllerInterceptors = getAllInterceptors(controllerClass, methodName);
        const allInterceptors = [...this.globalInterceptors, ...controllerInterceptors];
        
        if (allInterceptors.length === 0) {
          return await originalHandler(...args, response);
        }

        return await this.executeInterceptors(
          allInterceptors,
          {
            request,
            response,
            handler: originalHandler,
            args: [...args, response]
          }
        );
      } catch (error) {
        if (error instanceof RequestValidationError) {
          handleValidationError(error, response);
          return;
        }
        throw error;
      }
    };
  }

  private async executeInterceptors(
    interceptors: InterceptorFunction[],
    context: InterceptorContext
  ): Promise<unknown> {
    for (const interceptor of interceptors) {
      const result = await interceptor(context);
      
      if (!result.proceed) {
        return result.data;
      }
    }

    return await context.handler(...context.args);
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const parsedUrl = url.parse(req.url || '', true);
    
    const request: Request = {
      method: req.method || 'GET',
      url: req.url || '',
      path: parsedUrl.pathname || '/',
      query: parsedUrl.query as Record<string, string | string[]>,
      params: {},
      body: await this.parseBody(req),
      headers: req.headers as Record<string, string>
    };

    const response: Response = this.createResponse(res);

    try {
      const match = this.router.match(request.method, request.path);
      
      if (!match) {
        response.status(404).json({ error: 'Not Found' });
        return;
      }

      request.params = match.params;
      
      await this.executeMiddleware(match.route.middleware, request, response, async () => {
        const result = await match.route.handler(request, response);
        if (result !== undefined && !res.headersSent) {
          response.json(result);
        }
      });
      
    } catch (error) {
      console.error('Request error:', error);
      if (!res.headersSent) {
        response.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  private async executeMiddleware(
    middleware: MiddlewareFunction[],
    req: Request,
    res: Response,
    next: () => Promise<void>
  ): Promise<void> {
    let index = 0;

    const executeNext = async (): Promise<void> => {
      if (index >= middleware.length) {
        await next();
        return;
      }

      const currentMiddleware = middleware[index++];
      await currentMiddleware(req, res, executeNext);
    };

    await executeNext();
  }

  private async parseBody(req: http.IncomingMessage): Promise<unknown> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch {
          resolve(body);
        }
      });
    });
  }

  private createResponse(res: http.ServerResponse): Response {
    return {
      status: (code: number) => {
        res.statusCode = code;
        return this.createResponse(res);
      },
      json: (data: unknown) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return this.createResponse(res);
      },
      send: (data: unknown) => {
        res.end(data);
        return this.createResponse(res);
      },
      header: (key: string, value: string) => {
        res.setHeader(key, value);
        return this.createResponse(res);
      }
    };
  }

  listen(callback?: () => void): void {
    this.server.listen(this.options.port, this.options.host, callback);
  }

  close(callback?: () => void): void {
    this.server.close(callback);
  }
}