import { IFlyerHoldingRepository } from '@domain/field/holding/repositories/IFlyerHoldingRepository';
import { FlyerHolding } from '@domain/field/holding/entities/FlyerHolding';
import { Quantity } from '@domain/field/valueobjects/Quantity';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';

export class SpreadsheetFlyerHoldingRepository implements IFlyerHoldingRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Flyers';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findByStaffNo(staffNo: string): Promise<FlyerHolding | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const qtyIdx = headers.indexOf('保管枚数');
    const updatedIdx = headers.indexOf('更新日時');
    const locIdx = headers.indexOf('保管場所');

    if (staffIdIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[staffIdIdx]) === staffNo) {
        const rawLoc = locIdx !== -1 ? String(row[locIdx]) : '-';
        let cleanedLoc = rawLoc.trim();
        if (cleanedLoc === '自宅' || cleanedLoc.length === 0) {
          cleanedLoc = '-';
        } else {
          const cityMatch = cleanedLoc.match(/^[^市区町村]+[市区町村]/);
          if (cityMatch) {
            cleanedLoc = cityMatch[0];
          }
        }

        return new FlyerHolding({
          staffNo: String(row[staffIdIdx]),
          quantity: new Quantity(qtyIdx !== -1 ? Number(row[qtyIdx]) : 0),
          updatedAt: updatedIdx !== -1 ? new Date(Number(row[updatedIdx]) || String(row[updatedIdx])) : new Date(),
          cityName: cleanedLoc
        });
      }
    }
    return undefined;
  }

  public async findAllRaw(): Promise<any[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const staffIdIdx = headers.indexOf('スタッフID');
    const nameIdx = headers.indexOf('スタッフ名');
    const locIdx = headers.indexOf('保管場所');
    const qtyIdx = headers.indexOf('保管枚数');
    const updatedIdx = headers.indexOf('更新日時');

    if (staffIdIdx === -1) return [];

    const list: any[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawLoc = locIdx !== -1 ? String(row[locIdx]) : '-';
      const rawName = nameIdx !== -1 ? String(row[nameIdx]) : '';
      const qty = qtyIdx !== -1 ? Number(row[qtyIdx]) : 0;
      const t = updatedIdx !== -1 ? Number(row[updatedIdx]) || 0 : 0;

      let formattedDate = '';
      if (t > 0) {
        const date = new Date(t);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        formattedDate = `${mm}/${dd} ${hh}:${min}`;
      }

      list.push({
        id: 'Holding-' + String(row[staffIdIdx]),
        staffId: String(row[staffIdIdx]),
        staffName: rawName,
        location: rawLoc,
        count: qty,
        updatedAt: formattedDate
      });
    }
    return list;
  }

  public async save(holding: FlyerHolding): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['ID', 'スタッフID', 'スタッフ名', '保管場所', '保管枚数', '更新日時'];

    const staffIdIdx = headers.indexOf('スタッフID');
    const nameIdx = headers.indexOf('スタッフ名');
    const locIdx = headers.indexOf('保管場所');

    let rowIndex = -1;
    let existingName = '';
    let existingLocation = '自宅';

    if (staffIdIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][staffIdIdx]) === holding.staffNo) {
          rowIndex = i + 1;
          if (nameIdx !== -1) existingName = String(rows[i][nameIdx]);
          if (locIdx !== -1) existingLocation = String(rows[i][locIdx]);
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ID') return 'Holding-' + holding.staffNo;
      if (h === 'スタッフID') return holding.staffNo;
      if (h === 'スタッフ名') return existingName;
      if (h === '保管場所') return existingLocation;
      if (h === '保管枚数') return holding.getQuantity().getValue();
      if (h === '更新日時') return holding.getUpdatedAt().getTime();
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
