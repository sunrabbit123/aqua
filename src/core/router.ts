import { RouteHandler, MiddlewareFunction } from '../types';

export interface Route {
  method: string;
  path: string;
  handler: RouteHandler;
  middleware: MiddlewareFunction[];
}

export class Router {
  private routes: Route[] = [];
  private globalMiddleware: MiddlewareFunction[] = [];

  use(middleware: MiddlewareFunction): void {
    this.globalMiddleware.push(middleware);
  }

  addRoute(method: string, path: string, handler: RouteHandler, middleware: MiddlewareFunction[] = []): void {
    this.routes.push({
      method: method.toUpperCase(),
      path: this.normalizePath(path),
      handler,
      middleware: [...this.globalMiddleware, ...middleware]
    });
  }

  private normalizePath(path: string): string {
    if (path === '/') return path;
    // Remove trailing slashes safely to prevent ReDoS attacks
    while (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  match(method: string, path: string): { route: Route; params: Record<string, string> } | null {
    const normalizedPath = this.normalizePath(path);
    
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      
      const params = this.matchPath(route.path, normalizedPath);
      if (params !== null) {
        return { route, params };
      }
    }
    
    return null;
  }

  private matchPath(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    
    if (patternParts.length !== pathParts.length) {
      return null;
    }
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];
      
      if (patternPart.startsWith(':')) {
        const paramName = patternPart.slice(1);
        params[paramName] = pathPart;
      } else if (patternPart !== pathPart) {
        return null;
      }
    }
    
    return params;
  }

  getRoutes(): Route[] {
    return [...this.routes];
  }
}