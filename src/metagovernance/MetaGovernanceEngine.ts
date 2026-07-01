import { MetaGovernanceContext, GovernanceDecision } from "./MetaGovernancePolicy";

export interface IMetaGovernanceEngine {
  evaluatePolicies(context: MetaGovernanceContext): Promise<GovernanceDecision[]>;
  resolveConflicts(context: MetaGovernanceContext): Promise<Record<string, any>>;
  generateGovernanceDecision(context: MetaGovernanceContext): Promise<GovernanceDecision>;
  validateGovernanceState(context: MetaGovernanceContext): Promise<boolean>;
}

export abstract class BaseMetaGovernanceEngine implements IMetaGovernanceEngine {
  abstract evaluatePolicies(context: MetaGovernanceContext): Promise<GovernanceDecision[]>;
  abstract resolveConflicts(context: MetaGovernanceContext): Promise<Record<string, any>>;
  abstract generateGovernanceDecision(context: MetaGovernanceContext): Promise<GovernanceDecision>;
  abstract validateGovernanceState(context: MetaGovernanceContext): Promise<boolean>;
}
