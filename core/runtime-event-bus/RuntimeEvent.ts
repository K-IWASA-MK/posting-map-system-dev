import { RuntimeEventType } from './RuntimeEventType';
import { RuntimeEventSource } from './RuntimeEventSource';

/**
 * RuntimeEvent represents a generic type-safe event package carrying correlation context.
 */
export interface RuntimeEvent<TPayload = unknown> {
  readonly eventId: string;
  readonly timestamp: number;
  readonly type: RuntimeEventType;
  readonly source: RuntimeEventSource;
  readonly payload: TPayload;
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly projectId?: string;
  readonly pluginId?: string;
}
