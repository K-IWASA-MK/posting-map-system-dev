import { AuthenticationContext } from './AuthenticationContext';

export class AuthenticationResult {
  public readonly success: boolean;
  public readonly context: AuthenticationContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: AuthenticationContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: AuthenticationContext): AuthenticationResult {
    return new AuthenticationResult(true, context, null);
  }

  public static failureResult(reason: string): AuthenticationResult {
    return new AuthenticationResult(false, null, reason);
  }
}
