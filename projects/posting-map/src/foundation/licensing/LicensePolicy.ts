import { Edition } from './Edition';
import { LicenseStatus } from './LicenseStatus';
import { ApiRequest } from '@core/api/ApiRequest';

export class LicensePolicy {
  public readonly requiredEdition: Edition;
  public readonly requiredStatus: LicenseStatus;

  constructor(params: {
    requiredEdition?: Edition;
    requiredStatus?: LicenseStatus;
  }) {
    this.requiredEdition = params.requiredEdition || Edition.COMMUNITY;
    this.requiredStatus = params.requiredStatus || LicenseStatus.ACTIVE;
  }

  /**
   * Resolves the required licensing policy rules based on requested endpoint.
   */
  public static resolve(request: ApiRequest): LicensePolicy {
    // 1. Reset operations require ENTERPRISE edition
    if (request.query && request.query.action === 'resetAllSheets') {
      return new LicensePolicy({
        requiredEdition: Edition.ENTERPRISE,
        requiredStatus: LicenseStatus.ACTIVE
      });
    }

    // 2. Dashboards require STANDARD edition
    if (request.path === '/dashboard') {
      return new LicensePolicy({
        requiredEdition: Edition.STANDARD,
        requiredStatus: LicenseStatus.ACTIVE
      });
    }

    // 3. Defaults to COMMUNITY ACTIVE policy
    return new LicensePolicy({
      requiredEdition: Edition.COMMUNITY,
      requiredStatus: LicenseStatus.ACTIVE
    });
  }
}
