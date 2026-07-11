export type ExceptionCategory =
  | 'VALIDATION'
  | 'ROUTING'
  | 'SYSTEM'
  | 'CONFIGURATION'
  | 'FEATURE';

export const ExceptionCategory = {
  VALIDATION: 'VALIDATION' as ExceptionCategory,
  ROUTING: 'ROUTING' as ExceptionCategory,
  SYSTEM: 'SYSTEM' as ExceptionCategory,
  CONFIGURATION: 'CONFIGURATION' as ExceptionCategory,
  FEATURE: 'FEATURE' as ExceptionCategory,
};
