/**
 * ProfessionRoutingPolicy.ts
 * 
 * Configurable Routing Weights Policy Engine for Supervisor Profession Routing
 */

export interface RoutingWeights {
  missionWeight: number; // e.g. 0.4
  domainWeight: number;  // e.g. 0.3
  skillWeight: number;   // e.g. 0.2
  loadWeight: number;    // e.g. 0.1
}

export class ProfessionRoutingPolicy {
  public static readonly DEFAULT_WEIGHTS: RoutingWeights = {
    missionWeight: 0.4,
    domainWeight: 0.3,
    skillWeight: 0.2,
    loadWeight: 0.1
  };

  private weights: RoutingWeights;

  constructor(weights: RoutingWeights = ProfessionRoutingPolicy.DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  public getWeights(): RoutingWeights {
    return { ...this.weights };
  }

  public setWeights(weights: Partial<RoutingWeights>): void {
    this.weights = { ...this.weights, ...weights };
  }
}
