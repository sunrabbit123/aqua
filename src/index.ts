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
  getRouteMetadata,
  Interceptors,
  getClassInterceptors,
  getMethodInterceptors,
  getAllInterceptors,
  Body,
  Param,
  Query,
  getMethodValidationMetadata,
  clearValidationMetadata,
  TypiaBody,
  TypiaParam,
  TypiaQuery,
  getTypiaMethodValidationMetadata,
  clearTypiaValidationMetadata
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
  DomainFunction,
  InterceptorFunction,
  InterceptorContext,
  InterceptorResult,
  InterceptorMetadata,
  ValidationError,
  ValidationResult,
  ValidatorFunction,
  ParameterValidationMetadata,
  ValidationMetadata,
  TypiaValidationError,
  TypiaValidationResult,
  TypiaValidator,
  TypiaParameterMetadata,
  createTypiaValidator,
  createStringValidator
} from './types';

export {
  compose,
  pipe,
  asyncPipe,
  curry,
  memoize
} from './utils/functional';

export {
  stringValidator,
  numberValidator,
  booleanValidator,
  objectValidator,
  arrayValidator,
  optionalValidator,
  createTypeValidator
} from './validators';

import { AquaServer } from './core/server';
import { ServerOptions } from './types';

export function createApp(options?: ServerOptions): AquaServer {
  return new AquaServer(options);
}