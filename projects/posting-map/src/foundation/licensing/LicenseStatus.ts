export type LicenseStatus = 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL' | 'NONE';

export const LicenseStatus = {
  ACTIVE: 'ACTIVE' as LicenseStatus,
  EXPIRED: 'EXPIRED' as LicenseStatus,
  SUSPENDED: 'SUSPENDED' as LicenseStatus,
  TRIAL: 'TRIAL' as LicenseStatus,
  NONE: 'NONE' as LicenseStatus
};
