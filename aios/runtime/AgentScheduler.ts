import { DeliveryResult } from './DeliveryResult';
import { ScheduleResult } from './ScheduleResult';

export class AgentScheduler {
  /**
   * Translates a DeliveryResult into a ScheduleResult execution plan.
   * Throws an error if validation parameters fail.
   */
  public static schedule(
    delivery: DeliveryResult
  ): ScheduleResult {
    // Input boundary assertions
    if (!delivery) {
      throw new Error("AgentScheduler: DeliveryResult cannot be null or undefined.");
    }
    if (!delivery.messageId || delivery.messageId.trim() === "") {
      throw new Error("AgentScheduler: Invalid or empty messageId.");
    }
    if (!delivery.routeId || delivery.routeId.trim() === "") {
      throw new Error("AgentScheduler: Invalid or empty routeId.");
    }

    // Check delivered flag (exception on false per test requirement)
    if (!delivery.delivered) {
      throw new Error("AgentScheduler: Message was not successfully delivered.");
    }

    // Determine requestId deterministically (Contract-03)
    const requestId = `req-${delivery.messageId}`;

    return {
      requestId,
      scheduled: true,
      retryPolicyId: "RETRY-POLICY-DEFAULT",
      throttlePolicyId: "THROTTLE-POLICY-DEFAULT"
    };
  }
}
