import { YearMonth } from '../../../domain/common/valueobjects/YearMonth';
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

  public async findByWorkspace(workspaceId: string): Promise<Staff[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const nameIdx = headers.indexOf('スタッフ名');
    const lineIdx = headers.indexOf('LINEユーザーID');
    const wsIdx = headers.indexOf('ワークスペースID');
    const dateIdx = headers.indexOf('登録日時');

    if (wsIdx === -1) return [];

    const list: Staff[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[wsIdx]) === workspaceId) {
        list.push(new Staff({
          staffNo: staffIdIdx !== -1 ? String(row[staffIdIdx]) : '',
          displayName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          lineUserId: lineIdx !== -1 ? String(row[lineIdx]) : '',
          workspaceId: String(row[wsIdx]),
          createdAt: dateIdx !== -1 ? new Date(Number(row[dateIdx]) || String(row[dateIdx])) : new Date()
        }));
      }
    }
    return list;
  }

  public async findNewStaffByMonth(workspaceId: string, yearMonth: YearMonth): Promise<Staff[]> {
    const list = await this.findByWorkspace(workspaceId);
    const start = yearMonth.getStartDate().getTime();
    const end = yearMonth.getEndDate().getTime();
    return list.filter(staff => {
      const t = staff.createdAt.getTime();
      return t >= start && t <= end;
    });
  }

  public async getNextStaffNo(workspaceId: string): Promise<string> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) {
      return 'S001';
    }

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const wsIdx = headers.indexOf('ワークスペースID');

    if (staffIdIdx === -1 || wsIdx === -1) {
      return 'S001';
    }

    let maxNum = 0;
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[wsIdx]) === workspaceId) {
        const staffIdVal = String(row[staffIdIdx]);
        const match = staffIdVal.match(/^S(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    const nextNum = maxNum + 1;
    return 'S' + String(nextNum).padStart(3, '0');
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
