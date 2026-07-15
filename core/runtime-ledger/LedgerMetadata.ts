/**
 * LedgerMetadata models structured tracking values for replay and audit trails.
 */
export interface LedgerMetadata {
  readonly requestId?: string;
  readonly sessionId?: string;
  readonly projectId?: string;
  readonly pluginId?: string;
  readonly traceId?: string;
}
