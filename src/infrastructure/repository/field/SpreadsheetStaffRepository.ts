import { IStaffRepository } from '@domain/field/staff/repositories/IStaffRepository';
import { Staff } from '@domain/field/staff/entities/Staff';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';

export class SpreadsheetStaffRepository implements IStaffRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Staff';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findByStaffNo(staffNo: string): Promise<Staff | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const nameIdx = headers.indexOf('スタッフ名');
    const lineIdx = headers.indexOf('LINEユーザーID');
    const wsIdx = headers.indexOf('ワークスペースID');
    const dateIdx = headers.indexOf('登録日時');

    if (staffIdIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[staffIdIdx]) === staffNo) {
        return new Staff({
          staffNo: String(row[staffIdIdx]),
          displayName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          lineUserId: lineIdx !== -1 ? String(row[lineIdx]) : '',
          workspaceId: wsIdx !== -1 ? String(row[wsIdx]) : '',
          createdAt: dateIdx !== -1 ? new Date(Number(row[dateIdx]) || String(row[dateIdx])) : new Date()
        });
      }
    }
    return undefined;
  }

  public async findByLineUserId(lineUserId: string): Promise<Staff | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const nameIdx = headers.indexOf('スタッフ名');
    const lineIdx = headers.indexOf('LINEユーザーID');
    const wsIdx = headers.indexOf('ワークスペースID');
    const dateIdx = headers.indexOf('登録日時');

    if (lineIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[lineIdx]) === lineUserId) {
        return new Staff({
          staffNo: staffIdIdx !== -1 ? String(row[staffIdIdx]) : '',
          displayName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          lineUserId: String(row[lineIdx]),
          workspaceId: wsIdx !== -1 ? String(row[wsIdx]) : '',
          createdAt: dateIdx !== -1 ? new Date(Number(row[dateIdx]) || String(row[dateIdx])) : new Date()
        });
      }
    }
    return undefined;
  }

  public async save(staff: Staff): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['スタッフID', 'スタッフ名', 'LINEユーザーID', 'ワークスペースID', '登録日時'];

    const staffIdIdx = headers.indexOf('スタッフID');

    let rowIndex = -1;
    if (staffIdIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][staffIdIdx]) === staff.staffNo) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'スタッフID') return staff.staffNo;
      if (h === 'スタッフ名') return staff.displayName;
      if (h === 'LINEユーザーID') return staff.lineUserId;
      if (h === 'ワークスペースID') return staff.workspaceId;
      if (h === '登録日時') return staff.createdAt.getTime();
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
