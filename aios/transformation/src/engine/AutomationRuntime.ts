import { AutomationContext, IAutomationRuntime, IEventPublisher, ICommandDispatcher } from '../models/runtime_ports';

/**
 * AutomationRuntime
 * 
 * The Pure Pipeline Coordinator.
 * It owns no state, evaluates no rules, and makes no decisions.
 * It merely takes the ExecutionDecision and orchestrates the Dispatcher and Publisher.
 */
export class AutomationRuntime implements IAutomationRuntime {
  
  constructor(
    private readonly dispatcher: ICommandDispatcher,
    private readonly publisher: IEventPublisher
  ) {}

  async execute(context: AutomationContext): Promise<void> {
    // 1. Check the ExecutionDecision
    if (!context.decision.proceed) {
      // The event is halted (REJECT, IGNORE, QUARANTINE, etc.)
      // In a real OS, we might route to a DLQ or emit an error event based on context.decision.action,
      // but the normal execution pipeline is stopped here.
      return;
    }

    // 2. Delegate to Dispatcher
    const outputEvents = await this.dispatcher.dispatch(context.job);

    // 3. Delegate to Publisher (Publish all resulting events)
    for (const event of outputEvents) {
      await this.publisher.publish(event);
    }
  }
}
