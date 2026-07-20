export interface LedgerEntry {
  readonly ledgerId: string;
  readonly coordinationId: string;
  readonly protocolId: string;
  readonly protocolVersion: string;
  readonly timestamp: string;
  readonly previousHash: string;
  readonly currentHash: string;
  readonly payloadHash: string;
}
