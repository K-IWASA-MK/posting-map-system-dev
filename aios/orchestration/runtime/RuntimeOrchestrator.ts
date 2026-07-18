import { RuntimeEvent } from "../contracts/RuntimeEventContract";
import { RuntimeRegistry } from "../registry/RuntimeRegistry";
import { RuntimeEventBus } from "../events/RuntimeEventBus";
import { RuntimeEventRouter } from "../router/RuntimeEventRouter";
import { IntegrationPolicy } from "./IntegrationPolicy";
import { RuntimeIntegrationTrace } from "./RuntimeIntegrationTrace";

export class RuntimeOrchestrator {
  private readonly registry: RuntimeRegistry;
  private readonly eventBus: RuntimeEventBus;
  private readonly traceLogger: RuntimeIntegrationTrace;
  private readonly processedEvents = new Set<string>();

  constructor(
    registry: RuntimeRegistry,
    eventBus: RuntimeEventBus,
    traceLogger: RuntimeIntegrationTrace
  ) {
    this.registry = registry;
    this.eventBus = eventBus;
    this.traceLogger = traceLogger;
  }

  private generateTraceId(): string {
    return `TR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  }

  /**
   * Main entry point for orchestrating a runtime event.
   * Validates the contract, verifies replay safety, checks policies, and routes events to target runtimes.
   */
  public async orchestrate(event: RuntimeEvent): Promise<void> {
    const traceId = this.generateTraceId();

    // 1. Validate Event Contract
    const requiredKeys: (keyof RuntimeEvent)[] = [
      "eventId",
      "eventType",
      "sourceRuntime",
      "timestamp",
      "payload",
      "schemaVersion"
    ];
    let isContractValid = true;
    let contractError: string | undefined;

    for (const key of requiredKeys) {
      if (event[key] === undefined || event[key] === null) {
        isContractValid = false;
        contractError = `Missing required field: ${key}`;
        break;
      }
    }

    if (isContractValid && event.schemaVersion !== "v1") {
      isContractValid = false;
      contractError = `Unsupported schemaVersion: ${event.schemaVersion}. Expected: v1`;
    }

    if (!isContractValid) {
      this.traceLogger.record({
        traceId,
        eventId: event.eventId || "UNKNOWN",
        source: event.sourceRuntime || "UNKNOWN",
        target: "Orchestrator",
        status: "CONTRACT_INVALID",
        timestamp: Date.now(),
        error: contractError
      });
      throw new Error(`[Orchestrator] Event contract invalid: ${contractError}`);
    }

    // 2. Replay Safety Check
    if (this.processedEvents.has(event.eventId)) {
      console.log(`[Orchestrator] Replay Safety: Event ${event.eventId} already processed. Skipping.`);
      return;
    }
    this.processedEvents.add(event.eventId);

    // 3. Resolve routing targets
    const targets = RuntimeEventRouter.route(event);
    if (targets.length === 0) {
      // Leaf event (e.g. LEARNING_UPDATED)
      return;
    }

    // 4. Validate integration policy
    const policyCheck = IntegrationPolicy.isTransitionAllowed(event);
    if (!policyCheck.allowed) {
      for (const target of targets) {
        this.traceLogger.record({
          traceId,
          eventId: event.eventId,
          source: event.sourceRuntime,
          target,
          status: "BLOCKED_BY_POLICY",
          timestamp: Date.now(),
          error: policyCheck.reason
        });
      }
      throw new Error(`[Orchestrator] Integration policy blocked: ${policyCheck.reason}`);
    }

    // 5. Dispatch event to targets
    for (const target of targets) {
      if (!this.registry.has(target)) {
        // Target is not registered in capability registry
        this.traceLogger.record({
          traceId,
          eventId: event.eventId,
          source: event.sourceRuntime,
          target,
          status: "EVENT_FAILED",
          timestamp: Date.now(),
          error: `Target runtime ${target} is not registered.`
        });
        continue;
      }

      // Create targeted wrapper event
      const targetedEvent: RuntimeEvent = {
        ...event,
        targetRuntime: target
      };

      // Dispatches the targeted event to the target runtime's channel (e.g., ValidationRuntime)
      const dispatchBus = new RuntimeEventBus();
      // Temporarily bind subscribers of that specific channel from general bus
      // In this decoupled design, runtime handlers subscribe to the channel matching their name
      const dispatchResult = await this.eventBus.publish({
        ...targetedEvent,
        eventType: target as any // Repurpose eventType to channel name for routing delivery
      });

      if (!dispatchResult.success) {
        const errorMsg = dispatchResult.errors.map(e => e.message).join("; ");
        this.traceLogger.record({
          traceId,
          eventId: event.eventId,
          source: event.sourceRuntime,
          target,
          status: "EVENT_FAILED",
          timestamp: Date.now(),
          error: `Dispatch failed: ${errorMsg}`
        });
      } else {
        this.traceLogger.record({
          traceId,
          eventId: event.eventId,
          source: event.sourceRuntime,
          target,
          status: "DELIVERED",
          timestamp: Date.now()
        });
      }
    }
  }

  /**
   * Clears internal state caches.
   */
  public clear(): void {
    this.processedEvents.clear();
  }
}
