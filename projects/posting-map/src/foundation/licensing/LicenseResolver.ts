import { AuthenticationContext } from '@foundation/authentication/AuthenticationContext';
import { Resolver } from '@foundation/authorization/Resolver';
import { LicenseContext } from './LicenseContext';
import { EditionResolver } from './EditionResolver';
import { LicenseStatus } from './LicenseStatus';

/**
 * LicenseResolver - 開発用ライセンス解決スタブ (Stub Only)
 */
export class LicenseResolver implements Resolver<LicenseContext> {
  private editionResolver = new EditionResolver();

  public resolve(authContext: AuthenticationContext): LicenseContext {
    const edition = this.editionResolver.resolve(authContext);

    // Default stub: active status, expires in 30 days
    return new LicenseContext({
      edition,
      status: LicenseStatus.ACTIVE,
      licensed: true,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
      issuedAt: Date.now(),
      metadata: {
        licenseId: `lic-stub-${authContext.identityId}`,
        contractId: `ctr-stub-${authContext.identityId}`
      }
    });
  }
}
