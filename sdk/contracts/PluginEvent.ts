export interface PluginEventPayload {
  readonly eventId: string;
  readonly type: string;
  readonly sourcePluginId: string;
  readonly timestamp: string;
  readonly data: Record<string, unknown>;
}

export type PluginEventHandler = (payload: PluginEventPayload) => Promise<void> | void;

export interface PluginEventBus {
  publish(event: Omit<PluginEventPayload, 'eventId' | 'timestamp' | 'sourcePluginId'>): Promise<void>;
  subscribe(eventType: string, handler: PluginEventHandler): void;
  unsubscribe(eventType: string, handler: PluginEventHandler): void;
}
