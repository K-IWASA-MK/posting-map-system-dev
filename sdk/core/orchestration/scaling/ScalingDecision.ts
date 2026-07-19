import { ScalingDecision } from '../models/OrchestrationModels';

export class ScalingDecisionManager {
  private decisions: ScalingDecision[] = [];

  public recordDecision(decision: ScalingDecision): void {
    this.decisions.push(decision);
  }

  public getHistory(): ScalingDecision[] {
    return this.decisions;
  }
}
