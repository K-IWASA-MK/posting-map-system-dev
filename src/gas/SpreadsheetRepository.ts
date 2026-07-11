import { SpreadsheetBatchReader } from './SpreadsheetBatchReader';
import { SpreadsheetBatchWriter } from './SpreadsheetBatchWriter';

export interface AreaRecord {
  areaId: string;
  name: string;
  cityName: string;
  status: string;
  doneCount: number;
  totalCount: number;
}

export interface StaffRecord {
  lastName: string;
  firstName: string;
  status: string;
}

export class SpreadsheetRepository {
  private reader: SpreadsheetBatchReader;
  private writer: SpreadsheetBatchWriter;

  constructor() {
    this.reader = new SpreadsheetBatchReader();
    this.writer = new SpreadsheetBatchWriter();
  }

  /**
   * エリア一覧情報を取得する
   */
  public getAreas(tenantId: string, branchId: string): AreaRecord[] {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return []; // ヘッダーのみ、または空

    const records: AreaRecord[] = [];
    const headers = rawRows[0];

    // 列インデックスの動的特定 (ハードコード回避)
    const areaIdIdx = headers.indexOf('Area ID');
    const nameIdx = headers.indexOf('Name');
    const cityIdx = headers.indexOf('City');
    const statusIdx = headers.indexOf('Status');
    const doneIdx = headers.indexOf('Done Count');
    const totalIdx = headers.indexOf('Total Count');

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      records.push({
        areaId: areaIdIdx !== -1 ? String(row[areaIdIdx]) : '',
        name: nameIdx !== -1 ? String(row[nameIdx]) : '',
        cityName: cityIdx !== -1 ? String(row[cityIdx]) : '',
        status: statusIdx !== -1 ? String(row[statusIdx]) : 'NOT_STARTED',
        doneCount: doneIdx !== -1 ? Number(row[doneIdx]) : 0,
        totalCount: totalIdx !== -1 ? Number(row[totalIdx]) : 0
      });
    }

    return records;
  }

  /**
   * 複数件のイベントログを一括で追記保存する
   */
  public saveEventLogs(logs: any[]): void {
    if (logs.length === 0) return;

    const rawRows = this.reader.readAll('EventLogs');
    const headers = rawRows.length > 0 ? rawRows[0] : ['Event ID', 'Timestamp', 'Type', 'Payload'];

    const formattedRows = logs.map(log => {
      return headers.map(h => {
        if (h === 'Event ID') return log.eventId || `EV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        if (h === 'Timestamp') return log.timestamp || Date.now();
        if (h === 'Type') return log.type || 'unknown';
        if (h === 'Payload') return JSON.stringify(log.payload || {});
        return '';
      });
    });

    this.writer.appendRows('EventLogs', formattedRows);
  }

  /**
   * 配布員一覧を取得する
   */
  public getStaffs(): StaffRecord[] {
    const rawRows = this.reader.readAll('Staffs');
    if (rawRows.length <= 1) return [];

    const headers = rawRows[0];
    const lastIdx = headers.indexOf('Last Name');
    const firstIdx = headers.indexOf('First Name');
    const statusIdx = headers.indexOf('Status');

    const records: StaffRecord[] = [];
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      records.push({
        lastName: lastIdx !== -1 ? String(row[lastIdx]) : '',
        firstName: firstIdx !== -1 ? String(row[firstIdx]) : '',
        status: statusIdx !== -1 ? String(row[statusIdx]) : 'ACTIVE'
      });
    }
    return records;
  }

  /**
   * 特定のエリアの状況をバッチで更新する
   */
  public updateAreaStatus(areaId: string, status: string): void {
    const rawRows = this.reader.readAll('Areas');
    if (rawRows.length <= 1) return;

    const headers = rawRows[0];
    const areaIdIdx = headers.indexOf('Area ID');
    const statusIdx = headers.indexOf('Status');

    if (areaIdIdx === -1 || statusIdx === -1) return;

    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (String(row[areaIdIdx]) === areaId) {
        // 対象の行（1-indexed かつヘッダー込なので i + 1 行目）のステータス列（1-indexed なので statusIdx + 1 列目）
        this.writer.updateRange('Areas', i + 1, statusIdx + 1, [[status]]);
        break;
      }
    }
  }
}
