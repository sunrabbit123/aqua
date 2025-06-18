import { RouteHandler, MiddlewareFunction } from '../types';
export interface Route {
    method: string;
    path: string;
    handler: RouteHandler;
    middleware: MiddlewareFunction[];
}
export declare class Router {
    private routes;
    private globalMiddleware;
    use(middleware: MiddlewareFunction): void;
    addRoute(method: string, path: string, handler: RouteHandler, middleware?: MiddlewareFunction[]): void;
    private normalizePath;
    match(method: string, path: string): {
        route: Route;
        params: Record<string, any>;
    } | null;
    private matchPath;
    getRoutes(): Route[];
}
//# sourceMappingURL=router.d.ts.map