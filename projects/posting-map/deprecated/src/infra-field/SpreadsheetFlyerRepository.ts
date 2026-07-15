import { IFlyerRepository } from '@domain/field/repositories/IFlyerRepository';
import { FlyerStock } from '@domain/field/entities/FlyerStock';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';
import { FlyerRepositoryMapper } from './FlyerRepositoryMapper';
import { FlyerStockRecord } from '../../dto/field/FlyerStockRecord';

export class SpreadsheetFlyerRepository implements IFlyerRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Flyers';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findByOwner(ownerId: string): Promise<FlyerStock[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    const list: FlyerStock[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (ownerIdx !== -1 && String(row[ownerIdx]) === ownerId) {
        const record: FlyerStockRecord = {
          id: idIdx !== -1 ? String(row[idIdx]) : '',
          ownerId: String(row[ownerIdx]),
          areaId: areaIdx !== -1 ? String(row[areaIdx]) : '',
          quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'AVAILABLE',
          createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
          updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
        };
        list.push(FlyerRepositoryMapper.toEntity(record));
      }
    }
    return list;
  }

  public async findById(id: string): Promise<FlyerStock | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    if (idIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[idIdx]) === id) {
        const record: FlyerStockRecord = {
          id: String(row[idIdx]),
          ownerId: ownerIdx !== -1 ? String(row[ownerIdx]) : '',
          areaId: areaIdx !== -1 ? String(row[areaIdx]) : '',
          quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'AVAILABLE',
          createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
          updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
        };
        return FlyerRepositoryMapper.toEntity(record);
      }
    }
    return undefined;
  }

  public async findAvailable(areaId: AreaId): Promise<FlyerStock[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    const list: FlyerStock[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (areaIdx !== -1 && String(row[areaIdx]) === areaId.getValue()) {
        const status = statusIdx !== -1 ? String(row[statusIdx]).toUpperCase() : '';
        if (status === 'AVAILABLE' || status === 'RESERVED') {
          const record: FlyerStockRecord = {
            id: idIdx !== -1 ? String(row[idIdx]) : '',
            ownerId: ownerIdx !== -1 ? String(row[ownerIdx]) : '',
            areaId: String(row[areaIdx]),
            quantity: qtyIdx !== -1 ? Number(row[qtyIdx]) : 0,
            status,
            createdAt: createdIdx !== -1 ? Number(row[createdIdx]) : Date.now(),
            updatedAt: updatedIdx !== -1 ? Number(row[updatedIdx]) : Date.now()
          };
          list.push(FlyerRepositoryMapper.toEntity(record));
        }
      }
    }
    return list;
  }

  public async exists(id: string): Promise<boolean> {
    const flyer = await this.findById(id);
    return flyer !== undefined;
  }

  public async save(stock: FlyerStock): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const record = FlyerRepositoryMapper.toRecord(stock);

    const headers = rows.length > 0 ? rows[0] : ['ID', 'Owner ID', 'Area ID', 'Quantity', 'Status', 'Created At', 'Updated At'];
    
    const idIdx = headers.indexOf('ID');
    const ownerIdx = headers.indexOf('Owner ID');
    const areaIdx = headers.indexOf('Area ID');
    const qtyIdx = headers.indexOf('Quantity');
    const statusIdx = headers.indexOf('Status');
    const createdIdx = headers.indexOf('Created At');
    const updatedIdx = headers.indexOf('Updated At');

    // Find row index to update
    let rowIndex = -1;
    if (idIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][idIdx]) === stock.id) {
          rowIndex = i + 1; // 1-indexed and header-inclusive
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ID') return record.id;
      if (h === 'Owner ID') return record.ownerId;
      if (h === 'Area ID') return record.areaId;
      if (h === 'Quantity') return record.quantity;
      if (h === 'Status') return record.status;
      if (h === 'Created At') return record.createdAt;
      if (h === 'Updated At') return record.updatedAt;
      return '';
    });

    if (rowIndex !== -1) {
      // Update existing
      this.writer.updateRange(this.sheetName, rowIndex, 1, [rowValues]);
    } else {
      // Append new
      if (rows.length === 0) {
        // If sheet is empty, write headers first
        this.writer.appendRows(this.sheetName, [headers, rowValues]);
      } else {
        this.writer.appendRows(this.sheetName, [rowValues]);
      }
    }
  }
}
