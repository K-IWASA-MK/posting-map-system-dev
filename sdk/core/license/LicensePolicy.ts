import { LicenseRecord } from '../service/ServiceModels';

export class LicensePolicy {
  public checkExpiration(license: LicenseRecord): boolean {
    if (license.expiresAt <= Date.now()) {
      return false;
    }
    return true;
  }
}
