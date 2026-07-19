import { LicenseRecord } from '../service/ServiceModels';
import { LicensePolicy } from './LicensePolicy';

export class LicenseVerifier {
  private readonly policy = new LicensePolicy();

  public verify(license: LicenseRecord): boolean {
    if (license.status === 'REVOKED' || license.status === 'SUSPENDED' || license.status === 'EXPIRED') {
      return false;
    }

    if (!this.policy.checkExpiration(license)) {
      return false;
    }

    return true;
  }
}
