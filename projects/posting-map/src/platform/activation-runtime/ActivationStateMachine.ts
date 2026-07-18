import { ActivationStage } from "./ActivationStage";

export class ActivationStateMachine {
  private currentState: ActivationStage = ActivationStage.READY;
  private history: { stage: ActivationStage; timestamp: number }[] = [];
  private missionId: string;

  constructor(missionId: string) {
    this.missionId = missionId;
    this.recordTransition(ActivationStage.READY);
  }

  public getCurrentState(): ActivationStage {
    return this.currentState;
  }

  public transitionTo(nextState: ActivationStage): void {
    this.currentState = nextState;
    this.recordTransition(nextState);
    console.log(`[Activation SM] Transitioned to state: ${nextState} (Mission: ${this.missionId})`);
  }

  public getHistory() {
    return this.history;
  }

  private recordTransition(stage: ActivationStage): void {
    this.history.push({
      stage,
      timestamp: Date.now()
    });
  }
}
