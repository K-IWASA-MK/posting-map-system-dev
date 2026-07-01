import { StabilityVector, StabilityState, FeedbackSignal } from "./FeedbackSignal";

export interface IFeedbackStabilizationEngine {
  initialize(): Promise<boolean>;
  measure(context: Record<string, any>): Promise<StabilityVector>;
  analyze(vector: StabilityVector): Promise<StabilityState>;
  damp(signal: FeedbackSignal): Promise<FeedbackSignal>;
  stabilize(): Promise<boolean>;
}

export abstract class BaseFeedbackStabilizationEngine implements IFeedbackStabilizationEngine {
  abstract initialize(): Promise<boolean>;
  abstract measure(context: Record<string, any>): Promise<StabilityVector>;
  abstract analyze(vector: StabilityVector): Promise<StabilityState>;
  abstract damp(signal: FeedbackSignal): Promise<FeedbackSignal>;
  abstract stabilize(): Promise<boolean>;
}
