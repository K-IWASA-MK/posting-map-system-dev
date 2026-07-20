import * as crypto from 'crypto';
import { ProtocolRegistry } from './ProtocolRegistry';
import { CoordinationResult } from './CoordinationResult';
import { LedgerEntry } from './LedgerEntry';
import { LedgerChain } from './LedgerChain';

export class MicroLedger {
  private static chainState: LedgerChain = {
    chainId: "chain-main",
    latestHash: "GENESIS",
    entryCount: 0
  };

  private static readonly entries: LedgerEntry[] = [];

  /**
   * Appends an accepted CoordinationResult as an immutable LedgerEntry block.
   * Throws an error if the CoordinationResult is not accepted.
   */
  public static append(coordinationResult: CoordinationResult): LedgerEntry {
    // Contract-01: Accepted Coordination Only
    if (!coordinationResult.accepted) {
      throw new Error(`MicroLedger: Cannot append rejected coordination result. ID: ${coordinationResult.coordinationId}`);
    }

    const timestamp = new Date().toISOString();
    const coordinationId = coordinationResult.coordinationId;

    // Resolve protocolId and protocolVersion from coordinationId and ProtocolRegistry
    let protocolId = "aios-decision-v1"; // default fallback
    for (const meta of ProtocolRegistry.list()) {
      if (coordinationId.includes(meta.protocolId)) {
        protocolId = meta.protocolId;
        break;
      }
    }

    const registryMeta = ProtocolRegistry.get(protocolId);
    const protocolVersion = registryMeta ? registryMeta.version : "1.0.0";

    // Stable Hash Serialization (independent of JSON key ordering)
    const targetAgentsStr = (coordinationResult.targetAgents || []).join(',');
    const errorsStr = (coordinationResult.errors || []).map(e => `${e.code}:${e.message}`).join('|');
    const payloadStr = `coordinationId:${coordinationId}|accepted:${coordinationResult.accepted}|nextStage:${coordinationResult.nextStage}|targetAgents:${targetAgentsStr}|errors:${errorsStr}`;
    const payloadHash = this.sha256(payloadStr);

    const previousHash = this.chainState.latestHash;
    const inputStr = `${previousHash}|${payloadHash}|${timestamp}|${protocolId}|${protocolVersion}`;
    const currentHash = this.sha256(inputStr);

    const ledgerId = `block-${this.chainState.entryCount + 1}-${coordinationId}`;

    const newEntry: LedgerEntry = {
      ledgerId,
      coordinationId,
      protocolId,
      protocolVersion,
      timestamp,
      previousHash,
      currentHash,
      payloadHash
    };

    // Append to memory store
    this.entries.push(newEntry);

    // Update Chain State (Contract-02: Immutable update of Chain state)
    this.chainState = {
      chainId: this.chainState.chainId,
      latestHash: currentHash,
      entryCount: this.chainState.entryCount + 1
    };

    return newEntry;
  }

  /**
   * Retrieves the current LedgerChain state.
   */
  public static getChainState(): LedgerChain {
    return this.chainState;
  }

  /**
   * Lists all Ledger entries.
   */
  public static listEntries(): readonly LedgerEntry[] {
    return this.entries;
  }

  /**
   * Resets the ledger database in memory (primarily for unit test isolation).
   */
  public static reset(): void {
    this.entries.length = 0;
    this.chainState = {
      chainId: "chain-main",
      latestHash: "GENESIS",
      entryCount: 0
    };
  }

  private static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
