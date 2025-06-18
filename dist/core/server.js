"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AquaServer = void 0;
const http = __importStar(require("http"));
const url = __importStar(require("url"));
const router_1 = require("./router");
const decorators_1 = require("../decorators");
class AquaServer {
    server;
    router;
    options;
    constructor(options = {}) {
        this.options = {
            port: 3000,
            host: 'localhost',
            ...options
        };
        this.router = new router_1.Router();
        this.server = http.createServer(this.handleRequest.bind(this));
        if (this.options.middleware) {
            this.options.middleware.forEach(middleware => {
                this.router.use(middleware);
            });
        }
    }
    registerController(controllerClass) {
        const controllerMetadata = (0, decorators_1.getControllerMetadata)(controllerClass);
        const routes = (0, decorators_1.getRouteMetadata)(controllerClass);
        if (!controllerMetadata) {
            throw new Error(`Controller ${controllerClass.name} is not decorated with @Controller`);
        }
        routes.forEach(route => {
            const fullPath = controllerMetadata.prefix
                ? `${controllerMetadata.prefix}${route.path}`
                : route.path;
            const handler = controllerClass[route.handler];
            if (!handler || typeof handler !== 'function') {
                throw new Error(`Handler ${route.handler} not found in controller ${controllerClass.name}`);
            }
            this.router.addRoute(route.method, fullPath, handler.bind(controllerClass), route.middleware || []);
        });
    }
    use(middleware) {
        this.router.use(middleware);
    }
    async handleRequest(req, res) {
        const parsedUrl = url.parse(req.url || '', true);
        const request = {
            method: req.method || 'GET',
            url: req.url || '',
            path: parsedUrl.pathname || '/',
            query: parsedUrl.query,
            params: {},
            body: await this.parseBody(req),
            headers: req.headers
        };
        const response = this.createResponse(res);
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
        }
        catch (error) {
            console.error('Request error:', error);
            if (!res.headersSent) {
                response.status(500).json({ error: 'Internal Server Error' });
            }
        }
    }
    async executeMiddleware(middleware, req, res, next) {
        let index = 0;
        const executeNext = async () => {
            if (index >= middleware.length) {
                await next();
                return;
            }
            const currentMiddleware = middleware[index++];
            await currentMiddleware(req, res, executeNext);
        };
        await executeNext();
    }
    async parseBody(req) {
        return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                }
                catch {
                    resolve(body);
                }
            });
        });
    }
    createResponse(res) {
        return {
            status: (code) => {
                res.statusCode = code;
                return this.createResponse(res);
            },
            json: (data) => {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this.createResponse(res);
            },
            send: (data) => {
                res.end(data);
                return this.createResponse(res);
            },
            header: (key, value) => {
                res.setHeader(key, value);
                return this.createResponse(res);
            }
        };
    }
    listen(callback) {
        this.server.listen(this.options.port, this.options.host, callback);
    }
    close(callback) {
        this.server.close(callback);
    }
}
exports.AquaServer = AquaServer;
//# sourceMappingURL=server.js.map