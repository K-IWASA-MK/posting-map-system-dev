/**
 * CallbackContext.ts
 * Immutable context for an incoming AIOS Callback.
 */

export interface CallbackContext {
  readonly requestId: string;
  readonly receivedAt: Date;
  readonly source: string;
  readonly remoteAddress?: string;
  readonly headers?: Record<string, string>;
}
