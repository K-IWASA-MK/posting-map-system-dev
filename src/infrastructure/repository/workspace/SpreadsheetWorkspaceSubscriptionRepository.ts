import { IWorkspaceSubscriptionRepository } from '@domain/workspace/repositories/IWorkspaceSubscriptionRepository';
import { WorkspaceSubscription, SubscriptionStatus } from '@domain/workspace/entities/WorkspaceSubscription';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';

export class SpreadsheetWorkspaceSubscriptionRepository implements IWorkspaceSubscriptionRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Subscriptions';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSubscription | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const wsIdIdx = headers.indexOf('ワークスペースID');
    const statusIdx = headers.indexOf('ステータス');
    const startedIdx = headers.indexOf('開始日');
    const expiresIdx = headers.indexOf('期限日');

    if (wsIdIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[wsIdIdx]) === workspaceId) {
        return new WorkspaceSubscription({
          workspaceId: String(row[wsIdIdx]),
          status: statusIdx !== -1 ? (String(row[statusIdx]).toUpperCase() as SubscriptionStatus) : 'ACTIVE',
          startedAt: startedIdx !== -1 && row[startedIdx] ? new Date(row[startedIdx]) : new Date(),
          expiresAt: expiresIdx !== -1 && row[expiresIdx] ? new Date(row[expiresIdx]) : new Date()
        });
      }
    }
    return undefined;
  }

  public async save(subscription: WorkspaceSubscription): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['ワークスペースID', 'ステータス', '開始日', '期限日'];

    const wsIdIdx = headers.indexOf('ワークスペースID');

    let rowIndex = -1;
    if (wsIdIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][wsIdIdx]) === subscription.workspaceId) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ワークスペースID') return subscription.workspaceId;
      if (h === 'ステータス') return subscription.getStatus();
      if (h === '開始日') return subscription.getStartedAt().toISOString();
      if (h === '期限日') return subscription.getExpiresAt().toISOString();
      return '';
    });

    if (rowIndex !== -1) {
      this.writer.updateRange(this.sheetName, rowIndex, 1, [rowValues]);
    } else {
      if (rows.length === 0) {
        this.writer.appendRows(this.sheetName, [headers, rowValues]);
      } else {
        this.writer.appendRows(this.sheetName, [rowValues]);
      }
    }
  }
}
