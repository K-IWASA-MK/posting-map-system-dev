import { OSEvent } from './protocol';

/**
 * Transformation OS Internal Protocol Ports (Behavioral Contracts)
 * 
 * These interfaces define the 'Ports' through which the OS components interact 
 * with external infrastructure (Event Bus, Ledger/Database, State Machine).
 * They represent Capabilities, completely separated from the pure Canonical Data Dictionary.
 */

/**
 * IEventPublisher
 * Port: Abstracts the act of dispatching an event to the infrastructure (Bus).
 */
export interface IEventPublisher {
  publish(event: OSEvent): Promise<void>;
}

/**
 * IEventStore
 * Port: Abstracts the append-only ledger for OSEvents.
 */
export interface IEventStore {
  append(event: OSEvent): Promise<void>;
  getEventsBySubject(subjectURI: string): Promise<OSEvent[]>;
}

/**
 * IStateProjector
 * Port: Reconstructs a volatile Read Model (State) from an array of OSEvents.
 */
export interface IStateProjector<TState> {
  project(events: OSEvent[]): TState;
}

import { AutomationJob } from './protocol';
import { ExecutionDecision } from './execution';

/**
 * AutomationContext
 * 
 * The payload provided to the Automation Runtime.
 * By design, the runtime ONLY receives the parsed job and the pre-computed ExecutionDecision.
 * It does not receive raw Protocol concepts, ValidationResults, or RuleSets.
 */
export interface AutomationContext {
  readonly job: AutomationJob;
  readonly decision: ExecutionDecision;
}

/**
 * IAutomationRuntime
 * 
 * Port: The Coordinator that processes ExecutionDecisions.
 * Constraints:
 * - MUST NOT evaluate rules, read Diagnostic Catalogs, or validate payloads.
 * - MUST NOT maintain or write directly to AutomationState or EventStore.
 * - MUST NOT execute any logic other than routing based on `decision.action`.
 */
export interface IAutomationRuntime {
  execute(context: AutomationContext): Promise<void>;
}

import { Command } from './protocol';
import { ExecutionContext, ExecutionAttempt, ExecutionRecord } from './kernel';
import { IPlugin, PluginId } from './plugin';

/**
 * IExecutionLedger
 * 
 * Port: Appends immutable ExecutionRecords forming a definitive execution timeline.
 */
export interface IExecutionLedger {
  append(record: ExecutionRecord): Promise<void>;
}

/**
 * IPluginLoader
 * 
 * Port: Validates the payload against PluginManifest, checks API Compatibility,
 * and parses it into a valid IPlugin. Does NOT register it.
 */
export interface IPluginLoader {
  load(manifestPayload: unknown): Promise<IPlugin>;
}

/**
 * IPluginRegistry
 * 
 * Port: Manages the definitive state of loaded plugins. Only the Registry 
 * should insert or remove plugins from the OS memory.
 */
export interface IPluginRegistry {
  register(plugin: IPlugin): void;
  unregister(id: PluginId): void;
  get(id: PluginId): IPlugin | undefined;
  list(): readonly IPlugin[];
}

/**
 * IExecutionKernel
 * 
 * Port: Executes the Worker, providing Timeout, Retry, and Cancellation protection.
 * Completely stateless component mapping ExecutionContext to ExecutionAttempt.
 */
export interface IExecutionKernel {
  execute(
    context: ExecutionContext,
    command: Command,
    worker: IWorker
  ): Promise<readonly OSEvent[]>;
}

/**
 * IWorkerProvider
 * 
 * Port: Resolves the appropriate Worker for a given Command.
 * Enables dynamic plugin loading based on Command characteristics (type, version, tenant, etc.)
 * rather than simple static string mapping.
 */
export interface IWorkerProvider {
  get(command: Command): IWorker;
}

/**
 * ICommandDispatcher
 * 
 * Port: Extracts the Command from the AutomationJob, uses the WorkerProvider to find the
 * appropriate Worker, and delegates execution.
 */
export interface ICommandDispatcher {
  dispatch(job: AutomationJob): Promise<readonly OSEvent[]>;
}

/**
 * IWorker
 * 
 * Port: Executes the actual automation job logic (Plugin).
 * Constraints:
 * - MUST return an array of resulting events.
 * - MUST NOT publish events directly (returns them to the Runtime).
 * - MUST NOT mutate the AutomationState directly.
 * - MUST use the provided ExecutionAttempt for temporal awareness, not the ExecutionContext.
 */
export interface IWorker {
  execute(command: Command, attempt: ExecutionAttempt): Promise<readonly OSEvent[]>;
}

/**
 * IWorkerPlugin
 * 
 * Combines the Extensible OS Plugin definition with the Execution OS Worker interface.
 */
export interface IWorkerPlugin extends IPlugin, IWorker {}


