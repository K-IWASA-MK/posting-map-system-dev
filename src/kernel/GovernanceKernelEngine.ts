import { GovernanceRequest, GovernanceDecisionPacket, GovernanceKernelContext } from "./GovernanceRequest";

export interface IGovernanceKernelEngine {
  ingestRequest(request: GovernanceRequest): Promise<boolean>;
  evaluatePolicies(context: GovernanceKernelContext): Promise<GovernanceDecisionPacket[]>;
  routeDecision(packet: GovernanceDecisionPacket): Promise<boolean>;
  arbitrateConflict(context: GovernanceKernelContext): Promise<Record<string, any>>;
}

export abstract class BaseGovernanceKernelEngine implements IGovernanceKernelEngine {
  abstract ingestRequest(request: GovernanceRequest): Promise<boolean>;
  abstract evaluatePolicies(context: GovernanceKernelContext): Promise<GovernanceDecisionPacket[]>;
  abstract routeDecision(packet: GovernanceDecisionPacket): Promise<boolean>;
  abstract arbitrateConflict(context: GovernanceKernelContext): Promise<Record<string, any>>;
}
