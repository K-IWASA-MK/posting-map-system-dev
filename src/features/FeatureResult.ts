import { FeatureContext } from './FeatureContext';

export class FeatureResult {
  public readonly success: boolean;
  public readonly context: FeatureContext | null;
  public readonly failureReason: string | null;

  private constructor(success: boolean, context: FeatureContext | null, failureReason: string | null) {
    this.success = success;
    this.context = context;
    this.failureReason = failureReason;
  }

  public static successResult(context: FeatureContext): FeatureResult {
    return new FeatureResult(true, context, null);
  }

  public static failureResult(reason: string): FeatureResult {
    return new FeatureResult(false, null, reason);
  }
}
