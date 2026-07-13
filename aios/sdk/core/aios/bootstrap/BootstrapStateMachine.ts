import { BootstrapContext } from './BootstrapContext';
import { BootstrapStep } from './BootstrapStep';

export class BootstrapStateMachine {
  public getNextStep(current: BootstrapStep): BootstrapStep {
    switch (current) {
      case BootstrapStep.VALIDATE: return BootstrapStep.CREATE_REPOSITORY;
      case BootstrapStep.CREATE_REPOSITORY: return BootstrapStep.GENERATE_TEMPLATE;
      case BootstrapStep.GENERATE_TEMPLATE: return BootstrapStep.INITIALIZE_GIT;
      case BootstrapStep.INITIALIZE_GIT: return BootstrapStep.INITIAL_COMMIT;
      case BootstrapStep.INITIAL_COMMIT: return BootstrapStep.PUSH;
      case BootstrapStep.PUSH: return BootstrapStep.CREATE_TAG;
      case BootstrapStep.CREATE_TAG: return BootstrapStep.CREATE_RELEASE;
      case BootstrapStep.CREATE_RELEASE: return BootstrapStep.COMPLETE;
      default: return BootstrapStep.FAILED;
    }
  }

  public advance(context: BootstrapContext): void {
    if (context.currentStep === BootstrapStep.COMPLETE || context.currentStep === BootstrapStep.FAILED) {
      return;
    }
    context.currentStep = this.getNextStep(context.currentStep);
  }

  public fail(context: BootstrapContext, error: Error): void {
    context.currentStep = BootstrapStep.FAILED;
    context.error = error;
  }
}
