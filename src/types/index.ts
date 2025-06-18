export interface Request {
  method: string;
  url: string;
  path: string;
  query: Record<string, any>;
  params: Record<string, any>;
  body: any;
  headers: Record<string, string>;
}

export interface Response {
  status(code: number): Response;
  json(data: any): Response;
  send(data: any): Response;
  header(key: string, value: string): Response;
}

export type RouteHandler = (req: Request, res: Response) => any;

export interface RouteMetadata {
  method: string;
  path: string;
  handler: string;
  middleware?: MiddlewareFunction[];
}

export interface ControllerMetadata {
  prefix?: string;
  routes: RouteMetadata[];
}

export type MiddlewareFunction = (req: Request, res: Response, next: () => void) => void | Promise<void>;

export interface ServerOptions {
  port?: number;
  host?: string;
  middleware?: MiddlewareFunction[];
}

export type ServiceFunction<T extends any[] = any[], R = any> = (...args: T) => R | Promise<R>;
export type DomainFunction<T extends any[] = any[], R = any> = (...args: T) => R | Promise<R>;

export * from './interceptor';