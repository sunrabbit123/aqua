"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoize = exports.curry = exports.asyncPipe = exports.pipe = exports.compose = exports.createDomain = exports.createService = exports.getRouteMetadata = exports.getControllerMetadata = exports.Head = exports.Options = exports.Patch = exports.Delete = exports.Put = exports.Post = exports.Get = exports.Controller = exports.Router = exports.AquaServer = void 0;
exports.createApp = createApp;
var server_1 = require("./core/server");
Object.defineProperty(exports, "AquaServer", { enumerable: true, get: function () { return server_1.AquaServer; } });
var router_1 = require("./core/router");
Object.defineProperty(exports, "Router", { enumerable: true, get: function () { return router_1.Router; } });
var decorators_1 = require("./decorators");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return decorators_1.Controller; } });
Object.defineProperty(exports, "Get", { enumerable: true, get: function () { return decorators_1.Get; } });
Object.defineProperty(exports, "Post", { enumerable: true, get: function () { return decorators_1.Post; } });
Object.defineProperty(exports, "Put", { enumerable: true, get: function () { return decorators_1.Put; } });
Object.defineProperty(exports, "Delete", { enumerable: true, get: function () { return decorators_1.Delete; } });
Object.defineProperty(exports, "Patch", { enumerable: true, get: function () { return decorators_1.Patch; } });
Object.defineProperty(exports, "Options", { enumerable: true, get: function () { return decorators_1.Options; } });
Object.defineProperty(exports, "Head", { enumerable: true, get: function () { return decorators_1.Head; } });
Object.defineProperty(exports, "getControllerMetadata", { enumerable: true, get: function () { return decorators_1.getControllerMetadata; } });
Object.defineProperty(exports, "getRouteMetadata", { enumerable: true, get: function () { return decorators_1.getRouteMetadata; } });
var functional_1 = require("./utils/functional");
Object.defineProperty(exports, "createService", { enumerable: true, get: function () { return functional_1.createService; } });
Object.defineProperty(exports, "createDomain", { enumerable: true, get: function () { return functional_1.createDomain; } });
Object.defineProperty(exports, "compose", { enumerable: true, get: function () { return functional_1.compose; } });
Object.defineProperty(exports, "pipe", { enumerable: true, get: function () { return functional_1.pipe; } });
Object.defineProperty(exports, "asyncPipe", { enumerable: true, get: function () { return functional_1.asyncPipe; } });
Object.defineProperty(exports, "curry", { enumerable: true, get: function () { return functional_1.curry; } });
Object.defineProperty(exports, "memoize", { enumerable: true, get: function () { return functional_1.memoize; } });
const server_2 = require("./core/server");
function createApp(options) {
    return new server_2.AquaServer(options);
}
//# sourceMappingURL=index.js.map