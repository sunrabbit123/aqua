import { Request, Response } from './index';

export interface InterceptorContext {
  request: Request;
  response: Response;
  handler: Function;
  args: unknown[];
}

export interface InterceptorResult {
  proceed: boolean;
  data?: unknown;
}

export type InterceptorFunction = (
  context: InterceptorContext
) => InterceptorResult | Promise<InterceptorResult>;

export interface InterceptorMetadata {
  interceptors: InterceptorFunction[];
}