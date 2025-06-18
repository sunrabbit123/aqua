"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Head = exports.Options = exports.Patch = exports.Delete = exports.Put = exports.Post = exports.Get = void 0;
exports.Controller = Controller;
exports.getControllerMetadata = getControllerMetadata;
exports.getRouteMetadata = getRouteMetadata;
require("reflect-metadata");
const CONTROLLER_KEY = Symbol('controller');
const ROUTES_KEY = Symbol('routes');
function Controller(prefix) {
    return function (target) {
        const existingRoutes = Reflect.getMetadata(ROUTES_KEY, target) || [];
        const controllerMetadata = {
            prefix,
            routes: existingRoutes
        };
        Reflect.defineMetadata(CONTROLLER_KEY, controllerMetadata, target);
    };
}
function createMethodDecorator(method) {
    return function (path, middleware) {
        return function (target, propertyKey, descriptor) {
            const existingRoutes = Reflect.getMetadata(ROUTES_KEY, target) || [];
            const route = {
                method: method.toUpperCase(),
                path,
                handler: propertyKey,
                middleware
            };
            existingRoutes.push(route);
            Reflect.defineMetadata(ROUTES_KEY, existingRoutes, target);
        };
    };
}
exports.Get = createMethodDecorator('get');
exports.Post = createMethodDecorator('post');
exports.Put = createMethodDecorator('put');
exports.Delete = createMethodDecorator('delete');
exports.Patch = createMethodDecorator('patch');
exports.Options = createMethodDecorator('options');
exports.Head = createMethodDecorator('head');
function getControllerMetadata(target) {
    return Reflect.getMetadata(CONTROLLER_KEY, target);
}
function getRouteMetadata(target) {
    return Reflect.getMetadata(ROUTES_KEY, target) || [];
}
//# sourceMappingURL=index.js.map