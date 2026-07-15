import { RuntimeEventType } from '../runtime-event-bus/RuntimeEventType';
import { RuntimeEventSource } from '../runtime-event-bus/RuntimeEventSource';

/**
 * LedgerQueryFilter specifies filtering scopes for historical query lookups.
 */
export interface LedgerQueryFilter {
  readonly projectId?: string;
  readonly sessionId?: string;
  readonly eventType?: RuntimeEventType;
  readonly source?: RuntimeEventSource;
}
