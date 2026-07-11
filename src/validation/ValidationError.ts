export type ValidationErrorCode =
  | 'INVALID_REQUEST'
  | 'INVALID_METHOD'
  | 'INVALID_VERSION'
  | 'ROUTE_NOT_FOUND'
  | 'FEATURE_DISABLED';

export const ValidationError = {
  INVALID_REQUEST: 'INVALID_REQUEST' as ValidationErrorCode,
  INVALID_METHOD: 'INVALID_METHOD' as ValidationErrorCode,
  INVALID_VERSION: 'INVALID_VERSION' as ValidationErrorCode,
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND' as ValidationErrorCode,
  FEATURE_DISABLED: 'FEATURE_DISABLED' as ValidationErrorCode,
};
