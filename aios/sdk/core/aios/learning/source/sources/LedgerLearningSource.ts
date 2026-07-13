import { ILearningSource } from '../ILearningSource';
import { LearningRequest } from '../LearningRequest';
import { LearningDataset } from '../LearningDataset';
import { LearningSourceCapability } from '../LearningSourceCapability';
import { SourceType } from '../SourceType';
import { LearningDatasetBuilder } from '../LearningDatasetBuilder';
import { LearningRecord } from '../LearningRecord';
import { IExecutionLedgerReader } from '../../../ledger/ExecutionLedgerReader';

export class LedgerLearningSource implements ILearningSource {
  private ledgerReader: IExecutionLedgerReader;

  constructor(ledgerReader: IExecutionLedgerReader) {
    this.ledgerReader = ledgerReader;
  }

  public supports(request: LearningRequest): boolean {
    return request.sourceType === SourceType.LEDGER;
  }

  public capability(): LearningSourceCapability {
    return {
      supportsExecutionFilter: true,
      supportsTimeRange: false,
      supportsCorrelationId: true
    };
  }

  public priority(): number {
    return 100;
  }

  public async load(request: LearningRequest): Promise<LearningDataset> {
    const execId = request.executionId;
    if (!execId) {
      return LearningDatasetBuilder.build([], SourceType.LEDGER, 1);
    }

    const log = await this.ledgerReader.findByExecutionId(execId);
    if (!log) {
      return LearningDatasetBuilder.build([], SourceType.LEDGER, 1);
    }

    const records: LearningRecord[] = log.entries.map(entry => {
      const payload: Record<string, unknown> = {};
      if (entry.payload) {
        Object.keys(entry.payload).forEach(k => {
          payload[k] = (entry.payload as any)[k];
        });
      }
      
      return {
        recordId: entry.entryId,
        sourceType: SourceType.LEDGER,
        payload,
        timestamp: entry.timestamp
      };
    });

    return LearningDatasetBuilder.build(records, SourceType.LEDGER, 1);
  }
}
