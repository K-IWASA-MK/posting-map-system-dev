import { EnvironmentVector, AdaptationDecision, AdaptationStrategy } from "./EnvironmentVector";

export interface IAdaptiveKernelEngine {
  initialize(): Promise<boolean>;
  sense(context: Record<string, any>): Promise<EnvironmentVector>;
  mapContext(vector: EnvironmentVector): Promise<Record<string, any>>;
  evaluateStructure(context: Record<string, any>): Promise<number>;
  decide(context: Record<string, any>): Promise<AdaptationDecision>;
  simulate(strategy: AdaptationStrategy): Promise<Record<string, any>>;
  adapt(decision: AdaptationDecision): Promise<boolean>;
  feedback(decision: AdaptationDecision): Promise<boolean>;
}

export abstract class BaseAdaptiveKernelEngine implements IAdaptiveKernelEngine {
  abstract initialize(): Promise<boolean>;
  abstract sense(context: Record<string, any>): Promise<EnvironmentVector>;
  abstract mapContext(vector: EnvironmentVector): Promise<Record<string, any>>;
  abstract evaluateStructure(context: Record<string, any>): Promise<number>;
  abstract decide(context: Record<string, any>): Promise<AdaptationDecision>;
  abstract simulate(strategy: AdaptationStrategy): Promise<Record<string, any>>;
  abstract adapt(decision: AdaptationDecision): Promise<boolean>;
  abstract feedback(decision: AdaptationDecision): Promise<boolean>;
}
