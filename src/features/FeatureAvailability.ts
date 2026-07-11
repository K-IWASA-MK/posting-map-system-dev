export type FeatureAvailability =
  | 'AVAILABLE'
  | 'DISABLED'
  | 'LICENSE_REQUIRED'
  | 'NOT_AUTHORIZED'
  | 'NOT_SUPPORTED';

export const FeatureAvailability = {
  AVAILABLE: 'AVAILABLE' as FeatureAvailability,
  DISABLED: 'DISABLED' as FeatureAvailability,
  LICENSE_REQUIRED: 'LICENSE_REQUIRED' as FeatureAvailability,
  NOT_AUTHORIZED: 'NOT_AUTHORIZED' as FeatureAvailability,
  NOT_SUPPORTED: 'NOT_SUPPORTED' as FeatureAvailability
};
