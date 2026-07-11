import { IActivityRepository } from '@domain/field/activity/repositories/IActivityRepository';
import { YearMonth } from '../../../domain/common/valueobjects/YearMonth';
import { DistributionActivity } from '@domain/field/activity/entities/DistributionActivity';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { Location } from '@domain/field/valueobjects/Location';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';

export class SpreadsheetActivityRepository implements IActivityRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Activity';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findLatestByStaff(staffNo: string, limit: number): Promise<DistributionActivity[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const actIdIdx = headers.indexOf('活動ID');
    const staffIdIdx = headers.indexOf('スタッフID');
    const qtyIdx = headers.indexOf('報告枚数');
    const photoIdx = headers.indexOf('写真URL');
    const locIdx = headers.indexOf('位置情報');
    const dateIdx = headers.indexOf('活動日時');

    if (staffIdIdx === -1) return [];

    const list: DistributionActivity[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[staffIdIdx]) === staffNo) {
        // Parse location: "lat,lng"
        let lat = 0;
        let lng = 0;
        if (locIdx !== -1) {
          const parts = String(row[locIdx]).split(',');
          lat = Number(parts[0]) || 0;
          lng = Number(parts[1]) || 0;
        }

        list.push(new DistributionActivity({
          id: actIdIdx !== -1 ? String(row[actIdIdx]) : '',
          staffNo: String(row[staffIdIdx]),
          reportedQuantity: new Quantity(qtyIdx !== -1 ? Number(row[qtyIdx]) : 0),
          photoUrl: photoIdx !== -1 ? String(row[photoIdx]) : '',
          location: new Location(lat, lng, 0),
          occurredAt: dateIdx !== -1 ? new Date(Number(row[dateIdx]) || String(row[dateIdx])) : new Date()
        }));
      }
    }

    // Sort by occurredAt desc and limit
    list.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
    return list.slice(0, limit);
  }

  public async findByPeriod(start: Date, end: Date): Promise<DistributionActivity[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const actIdIdx = headers.indexOf('活動ID');
    const staffIdIdx = headers.indexOf('スタッフID');
    const qtyIdx = headers.indexOf('報告枚数');
    const photoIdx = headers.indexOf('写真URL');
    const locIdx = headers.indexOf('位置情報');
    const dateIdx = headers.indexOf('活動日時');

    if (dateIdx === -1) return [];

    const list: DistributionActivity[] = [];
    const startTime = start.getTime();
    const endTime = end.getTime();

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const timeVal = Number(row[dateIdx]);
      if (timeVal >= startTime && timeVal <= endTime) {
        let lat = 0;
        let lng = 0;
        if (locIdx !== -1) {
          const parts = String(row[locIdx]).split(',');
          lat = Number(parts[0]) || 0;
          lng = Number(parts[1]) || 0;
        }

        list.push(new DistributionActivity({
          id: actIdIdx !== -1 ? String(row[actIdIdx]) : '',
          staffNo: staffIdIdx !== -1 ? String(row[staffIdIdx]) : '',
          reportedQuantity: new Quantity(qtyIdx !== -1 ? Number(row[qtyIdx]) : 0),
          photoUrl: photoIdx !== -1 ? String(row[photoIdx]) : '',
          location: new Location(lat, lng, 0),
          occurredAt: new Date(timeVal)
        }));
      }
    }
    return list;
  }

  public async findByYearMonth(workspaceId: string, yearMonth: YearMonth): Promise<DistributionActivity[]> {
    const staffRows = this.reader.readAll('Staff');
    if (staffRows.length <= 1) return [];
    
    const staffHeaders = staffRows[0];
    const staffIdIdx = staffHeaders.indexOf('スタッフID');
    const wsIdx = staffHeaders.indexOf('ワークスペースID');
    if (staffIdIdx === -1 || wsIdx === -1) return [];

    const allowedStaffNos = new Set<string>();
    for (let i = 1; i < staffRows.length; i++) {
      if (String(staffRows[i][wsIdx]) === workspaceId) {
        allowedStaffNos.add(String(staffRows[i][staffIdIdx]));
      }
    }

    if (allowedStaffNos.size === 0) return [];

    const start = yearMonth.getStartDate();
    const end = yearMonth.getEndDate();
    const allPeriodActivities = await this.findByPeriod(start, end);

    return allPeriodActivities.filter(a => allowedStaffNos.has(a.staffNo));
  }

  public async save(activity: DistributionActivity): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['活動ID', 'スタッフID', '報告枚数', '写真URL', '位置情報', '活動日時'];

    const actIdIdx = headers.indexOf('活動ID');

    let rowIndex = -1;
    if (actIdIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][actIdIdx]) === activity.id) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    const locString = `${activity.location.latitude},${activity.location.longitude}`;

    const rowValues = headers.map(h => {
      if (h === '活動ID') return activity.id;
      if (h === 'スタッフID') return activity.staffNo;
      if (h === '報告枚数') return activity.reportedQuantity.getValue();
      if (h === '写真URL') return activity.photoUrl;
      if (h === '位置情報') return locString;
      if (h === '活動日時') return activity.occurredAt.getTime();
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
