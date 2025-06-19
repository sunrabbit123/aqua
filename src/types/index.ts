export interface Request {
  method: string;
  url: string;
  path: string;
  query: Record<string, string | string[]>;
  params: Record<string, string>;
  body: unknown;
  headers: Record<string, string>;
}

export interface Response {
  status(code: number): Response;
  json(data: unknown): Response;
  send(data: unknown): Response;
  header(key: string, value: string): Response;
}

export type RouteHandler = (req: Request, res: Response) => unknown | Promise<unknown>;

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

export type ServiceFunction<T extends unknown[] = unknown[], R = unknown> = (...args: T) => R | Promise<R>;
export type DomainFunction<T extends unknown[] = unknown[], R = unknown> = (...args: T) => R | Promise<R>;

export * from './interceptor';