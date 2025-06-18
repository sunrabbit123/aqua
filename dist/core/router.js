"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
class Router {
    routes = [];
    globalMiddleware = [];
    use(middleware) {
        this.globalMiddleware.push(middleware);
    }
    addRoute(method, path, handler, middleware = []) {
        this.routes.push({
            method: method.toUpperCase(),
            path: this.normalizePath(path),
            handler,
            middleware: [...this.globalMiddleware, ...middleware]
        });
    }
    normalizePath(path) {
        if (path === '/')
            return path;
        return path.replace(/\/+$/, '');
    }
    match(method, path) {
        const normalizedPath = this.normalizePath(path);
        for (const route of this.routes) {
            if (route.method !== method.toUpperCase())
                continue;
            const params = this.matchPath(route.path, normalizedPath);
            if (params !== null) {
                return { route, params };
            }
        }
        return null;
    }
    matchPath(pattern, path) {
        const patternParts = pattern.split('/');
        const pathParts = path.split('/');
        if (patternParts.length !== pathParts.length) {
            return null;
        }
        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];
            if (patternPart.startsWith(':')) {
                const paramName = patternPart.slice(1);
                params[paramName] = pathPart;
            }
            else if (patternPart !== pathPart) {
                return null;
            }
        }
        return params;
    }
    getRoutes() {
        return [...this.routes];
    }
}
exports.Router = Router;
//# sourceMappingURL=router.js.map