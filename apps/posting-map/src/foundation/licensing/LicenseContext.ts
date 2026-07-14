import { Edition } from './Edition';
import { LicenseStatus } from './LicenseStatus';

export interface LicenseMetadata {
  readonly licenseId?: string;
  readonly contractId?: string;
  readonly issuedBy?: string;
  readonly renewalDate?: number;
  readonly [key: string]: any;
}

export class LicenseContext {
  public readonly edition: Edition;
  public readonly status: LicenseStatus;
  public readonly licensed: boolean;
  public readonly expiresAt: number;
  public readonly issuedAt: number;
  public readonly metadata: LicenseMetadata;

  constructor(params: {
    edition: Edition;
    status: LicenseStatus;
    licensed: boolean;
    expiresAt: number;
    issuedAt: number;
    metadata?: LicenseMetadata;
  }) {
    this.edition = params.edition;
    this.status = params.status;
    this.licensed = params.licensed;
    this.expiresAt = params.expiresAt;
    this.issuedAt = params.issuedAt;
    this.metadata = params.metadata || {};
  }
}
