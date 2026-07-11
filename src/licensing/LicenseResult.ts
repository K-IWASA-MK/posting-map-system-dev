import { LicenseContext } from './LicenseContext';

export class LicenseResult {
  public readonly success: boolean;
  public readonly context: LicenseContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: LicenseContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: LicenseContext): LicenseResult {
    return new LicenseResult(true, context, null);
  }

  public static failureResult(reason: string): LicenseResult {
    return new LicenseResult(false, null, reason);
  }
}
