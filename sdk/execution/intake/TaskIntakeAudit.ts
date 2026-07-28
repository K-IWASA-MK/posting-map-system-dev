/**
 * TaskIntakeAudit.ts
 * 
 * AIOS Task Intake Audit Manager
 * 
 * 外部リクエストの受付履歴（TaskIntakeAuditRecord）の保持・管理・スナップショット提供を行う。
 */

export interface TaskIntakeAuditRecord {
  readonly requestId: string;
  readonly taskId?: string;
  readonly sourceApplication: string;
  readonly receivedAt: string;
  readonly status: 'ACCEPTED' | 'REJECTED';
  readonly error?: string;
}

export class TaskIntakeAuditManager {
  private static records: TaskIntakeAuditRecord[] = [];

  /**
   * 監査記録を追記する
   */
  static recordIntake(record: TaskIntakeAuditRecord): void {
    this.records.push(Object.freeze({ ...record }));
  }

  /**
   * 特定の requestId の監査記録を取得する
   */
  static getByRequestId(requestId: string): TaskIntakeAuditRecord | undefined {
    return this.records.find((r) => r.requestId === requestId);
  }

  /**
   * 全監査記録のスナップショットを取得する
   */
  static getAllRecords(): readonly TaskIntakeAuditRecord[] {
    return Object.freeze([...this.records]);
  }

  /**
   * 監査記録をクリアする（テスト用・初期化用）
   */
  static clear(): void {
    this.records = [];
  }
}
