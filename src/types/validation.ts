export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export type ValidatorFunction<T = unknown> = (value: unknown) => ValidationResult<T>;

export interface ParameterValidationMetadata {
  parameterIndex: number;
  type: 'body' | 'param' | 'query';
  validator?: ValidatorFunction;
  isOptional?: boolean;
  propertyKey?: string;
}

export interface ValidationMetadata {
  parameters: ParameterValidationMetadata[];
}