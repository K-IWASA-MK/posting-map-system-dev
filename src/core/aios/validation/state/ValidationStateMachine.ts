import { ValidationStatus } from '../models/ValidationEnums';

export class ValidationStateMachine {
  private currentState: ValidationStatus = ValidationStatus.CREATED;

  public transition(newState: ValidationStatus): void {
    const validTransitions = this.getValidTransitions();
    if (!validTransitions.includes(newState)) {
      throw new Error(`Invalid transition from ${this.currentState} to ${newState}`);
    }
    this.currentState = newState;
  }

  public getState(): ValidationStatus {
    return this.currentState;
  }

  private getValidTransitions(): ValidationStatus[] {
    switch (this.currentState) {
      case ValidationStatus.CREATED:
        return [ValidationStatus.PLANNING, ValidationStatus.FAILED];
      case ValidationStatus.PLANNING:
        return [ValidationStatus.VALIDATOR_SELECTED, ValidationStatus.FAILED];
      case ValidationStatus.VALIDATOR_SELECTED:
        return [ValidationStatus.READY, ValidationStatus.FAILED];
      case ValidationStatus.READY:
        return [ValidationStatus.VALIDATING, ValidationStatus.FAILED];
      case ValidationStatus.VALIDATING:
        return [ValidationStatus.AGGREGATING, ValidationStatus.FAILED, ValidationStatus.TIMEOUT];
      case ValidationStatus.AGGREGATING:
        return [ValidationStatus.VERIFIED, ValidationStatus.FAILED];
      case ValidationStatus.VERIFIED:
        return [ValidationStatus.COMPLETED];
      case ValidationStatus.COMPLETED:
        return [ValidationStatus.ARCHIVED];
      case ValidationStatus.FAILED:
        return [ValidationStatus.RETRYING, ValidationStatus.ARCHIVED];
      case ValidationStatus.RETRYING:
        return [ValidationStatus.VALIDATING, ValidationStatus.FAILED];
      case ValidationStatus.TIMEOUT:
        return [ValidationStatus.FAILED, ValidationStatus.RETRYING];
      default:
        return [];
    }
  }
}
