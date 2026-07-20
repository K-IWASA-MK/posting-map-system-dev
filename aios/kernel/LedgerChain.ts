export interface LedgerChain {
  readonly chainId: string;
  readonly latestHash: string;
  readonly entryCount: number;
}
