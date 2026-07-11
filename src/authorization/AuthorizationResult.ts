import { AuthorizationContext } from './AuthorizationContext';

export class AuthorizationResult {
  public readonly success: boolean;
  public readonly context: AuthorizationContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: AuthorizationContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: AuthorizationContext): AuthorizationResult {
    return new AuthorizationResult(true, context, null);
  }

  public static failureResult(reason: string): AuthorizationResult {
    return new AuthorizationResult(false, null, reason);
  }
}
