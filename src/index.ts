export { AquaServer } from './core/server';
export { Router } from './core/router';

export {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Options,
  Head,
  getControllerMetadata,
  getRouteMetadata
} from './decorators';

export {
  Request,
  Response,
  RouteHandler,
  RouteMetadata,
  ControllerMetadata,
  MiddlewareFunction,
  ServerOptions,
  ServiceFunction,
  DomainFunction
} from './types';

export {
  createService,
  createDomain,
  compose,
  pipe,
  asyncPipe,
  curry,
  memoize
} from './utils/functional';

import { AquaServer } from './core/server';
import { ServerOptions } from './types';

export function createApp(options?: ServerOptions): AquaServer {
  return new AquaServer(options);
}