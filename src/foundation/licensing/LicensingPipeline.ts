import { ApiRequest } from '@core/api/ApiRequest';
import { ApiExecutionContext } from '@infra/gas/ApiExecutionContext';
import { AuthenticationContext, IdentityType, AuthenticationMethod } from '@foundation/authentication/AuthenticationContext';
import { LicenseResolver } from './LicenseResolver';
import { LicenseContext } from './LicenseContext';
import { LicensePolicy } from './LicensePolicy';
import { EditionRank } from './Edition';
import { LicenseStatus } from './LicenseStatus';
import { LicenseException } from '@core/exceptions/LicenseException';
import { GasConfigurationProvider } from '@infra/gas/GasConfigurationProvider';

export class LicensingPipeline {
  private static instance: LicensingPipeline | null = null;
  private licenseResolver = new LicenseResolver();

  private constructor() {}

  public static getInstance(): LicensingPipeline {
    if (!LicensingPipeline.instance) {
      LicensingPipeline.instance = new LicensingPipeline();
    }
    return LicensingPipeline.instance;
  }

  public execute(request: ApiRequest, context: ApiExecutionContext): void {
    const config = GasConfigurationProvider.getInstance();
    const flags = config.getFeatureFlags();

    // 1. Fetch Authentication Context (Fallback to anonymous if missing)
    let authContext = context.getAuthenticationContext();
    if (!authContext) {
      authContext = new AuthenticationContext({
        identityId: 'anonymous',
        identityType: IdentityType.ANONYMOUS,
        authenticationMethod: AuthenticationMethod.NONE,
        authenticated: false,
        issuedAt: Date.now()
      });
    }

    // 2. Resolve License Context
    const licenseContext = this.licenseResolver.resolve(authContext);
    context.setLicenseContext(licenseContext);

    // 3. Feature toggle check
    if (flags.licensingEnabled === false) {
      return;
    }

    const policy = LicensePolicy.resolve(request);

    // 4. Validate License Status
    if (flags.licenseValidation !== false) {
      if (licenseContext.status !== LicenseStatus.ACTIVE && licenseContext.status !== LicenseStatus.TRIAL) {
        throw new LicenseException(
          'PM-LIC-002',
          `License is inactive or suspended. Current status: ${licenseContext.status}`,
          request.requestId
        );
      }
      if (licenseContext.licensed === false) {
        throw new LicenseException(
          'PM-LIC-001',
          'Feature requires a valid active license registration.',
          request.requestId
        );
      }
    }

    // 5. Validate Edition Level
    if (flags.editionValidation !== false) {
      const userRank = EditionRank[licenseContext.edition];
      const requiredRank = EditionRank[policy.requiredEdition];

      if (userRank < requiredRank) {
        throw new LicenseException(
          'PM-LIC-003',
          `Insufficient subscription plan level. Requires ${policy.requiredEdition} (yours: ${licenseContext.edition}).`,
          request.requestId
        );
      }
    }
  }
}
