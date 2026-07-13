import * as fs from 'fs';
import * as path from 'path';
import { IExecutionLedgerWriter } from './ExecutionLedgerWriter';
import { IExecutionLedgerReader } from './ExecutionLedgerReader';
import { ExecutionLedgerEntry } from './ExecutionLedgerEntry';
import { ExecutionLedger } from './ExecutionLedger';
import { ExecutionLedgerStatus } from './ExecutionLedgerStatus';

/**
 * A mock adapter that reads/writes Ledger entries to a JSON file.
 * In a real scenario, this could use SQLite, Cloud Spanner, etc.
 */
export class JsonExecutionLedgerAdapter implements IExecutionLedgerWriter, IExecutionLedgerReader {
  private filePath: string;
  private entries: ExecutionLedgerEntry[] = [];

  constructor(filePath: string) {
    this.filePath = filePath;
    this.loadFromFile();
  }

  private loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf-8');
        this.entries = JSON.parse(data);
      }
    } catch (e) {
      console.error(`Failed to load ledger from ${this.filePath}`, e);
    }
  }

  public async append(entry: ExecutionLedgerEntry): Promise<void> {
    this.entries.push(Object.freeze({ ...entry }));
  }

  public async appendAll(entries: ExecutionLedgerEntry[]): Promise<void> {
    for (const entry of entries) {
      this.entries.push(Object.freeze({ ...entry }));
    }
  }

  public async flush(): Promise<void> {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.entries, null, 2), 'utf-8');
    } catch (e) {
      console.error(`Failed to flush ledger to ${this.filePath}`, e);
      throw e;
    }
  }

  // --- Reader Implementation ---

  public async findByExecutionId(executionId: string): Promise<ExecutionLedger | null> {
    const execEntries = this.entries.filter(e => e.executionId === executionId);
    if (execEntries.length === 0) return null;

    // Build the Ledger container dynamically from entries
    return Object.freeze({
      executionId,
      contextId: 'extracted-from-context-entry', // In a real system, extract from the CONTEXT entry
      sessionId: 'extracted-from-session',
      status: ExecutionLedgerStatus.COMPLETED, // Mock
      entries: Object.freeze([...execEntries]),
      createdAt: execEntries[0].timestamp,
      version: '1.0',
      metadata: {
        schemaVersion: '1.0',
        ledgerVersion: '1.0',
        runtime: 'Node.js',
        toolVersion: '1.0.0',
        project: 'MockProject',
        generatedAt: execEntries[execEntries.length - 1].timestamp
      }
    });
  }

  public async findByContextId(contextId: string): Promise<ExecutionLedger[]> {
    // Mock implementation
    return [];
  }

  public async findByDecisionId(decisionId: string): Promise<ExecutionLedgerEntry | null> {
    const entry = this.entries.find(e => 
      e.entryType === 'DECISION' && (e.payload as any).decisionId === decisionId
    );
    return entry || null;
  }

  public async findAll(): Promise<ExecutionLedger[]> {
    return [];
  }
}
