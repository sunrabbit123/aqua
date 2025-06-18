import { Request, Response } from './index';

export interface InterceptorContext {
  request: Request;
  response: Response;
  handler: Function;
  args: any[];
}

export interface InterceptorResult {
  proceed: boolean;
  data?: any;
}

export type InterceptorFunction = (
  context: InterceptorContext
) => InterceptorResult | Promise<InterceptorResult>;

export interface InterceptorMetadata {
  interceptors: InterceptorFunction[];
}