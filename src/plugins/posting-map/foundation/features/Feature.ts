export type Feature =
  | 'GOOGLE_MAPS'
  | 'MAPBOX'
  | 'AIOS_BRIDGE'
  | 'REALTIME_DASHBOARD'
  | 'ANALYTICS'
  | 'REPORTS'
  | 'EXPORT'
  | 'FIELD_MONITORING';

export const Feature = {
  GOOGLE_MAPS: 'GOOGLE_MAPS' as Feature,
  MAPBOX: 'MAPBOX' as Feature,
  AIOS_BRIDGE: 'AIOS_BRIDGE' as Feature,
  REALTIME_DASHBOARD: 'REALTIME_DASHBOARD' as Feature,
  ANALYTICS: 'ANALYTICS' as Feature,
  REPORTS: 'REPORTS' as Feature,
  EXPORT: 'EXPORT' as Feature,
  FIELD_MONITORING: 'FIELD_MONITORING' as Feature
};
