import { ServerOptions, MiddlewareFunction } from '../types';
export declare class AquaServer {
    private server;
    private router;
    private options;
    constructor(options?: ServerOptions);
    registerController(controllerClass: any): void;
    use(middleware: MiddlewareFunction): void;
    private handleRequest;
    private executeMiddleware;
    private parseBody;
    private createResponse;
    listen(callback?: () => void): void;
    close(callback?: () => void): void;
}
//# sourceMappingURL=server.d.ts.map