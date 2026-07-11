import { IDistributorRepository } from '@domain/field/repositories/IDistributorRepository';
import { Distributor } from '@domain/field/entities/Distributor';
import { AreaId } from '@domain/field/valueobjects/AreaId';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';
import { DistributorRepositoryMapper } from './DistributorRepositoryMapper';
import { DistributorRecord } from '../../dto/field/DistributorRecord';

export class SpreadsheetDistributorRepository implements IDistributorRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Distributors';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findById(id: string): Promise<Distributor | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    if (idIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[idIdx]) === id) {
        const rawAreaIds = areaIdsIdx !== -1 && row[areaIdsIdx] 
          ? String(row[areaIdsIdx]).split(',').map(s => s.trim()).filter(s => s.length > 0)
          : [];
        const record: DistributorRecord = {
          id: String(row[idIdx]),
          name: nameIdx !== -1 ? String(row[nameIdx]) : '',
          identityId: identityIdx !== -1 ? String(row[identityIdx]) : '',
          areaIds: rawAreaIds,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'INACTIVE'
        };
        return DistributorRepositoryMapper.toEntity(record);
      }
    }
    return undefined;
  }

  public async findByArea(areaId: AreaId): Promise<Distributor[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    const list: Distributor[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rawAreaIds = areaIdsIdx !== -1 && row[areaIdsIdx] 
        ? String(row[areaIdsIdx]).split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [];
      if (rawAreaIds.includes(areaId.getValue())) {
        const record: DistributorRecord = {
          id: idIdx !== -1 ? String(row[idIdx]) : '',
          name: nameIdx !== -1 ? String(row[nameIdx]) : '',
          identityId: identityIdx !== -1 ? String(row[identityIdx]) : '',
          areaIds: rawAreaIds,
          status: statusIdx !== -1 ? String(row[statusIdx]) : 'INACTIVE'
        };
        list.push(DistributorRepositoryMapper.toEntity(record));
      }
    }
    return list;
  }

  public async save(distributor: Distributor): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const record = DistributorRepositoryMapper.toRecord(distributor);

    const headers = rows.length > 0 ? rows[0] : ['ID', 'Name', 'Identity ID', 'Area IDs', 'Status'];
    
    const idIdx = headers.indexOf('ID');
    const nameIdx = headers.indexOf('Name');
    const identityIdx = headers.indexOf('Identity ID');
    const areaIdsIdx = headers.indexOf('Area IDs');
    const statusIdx = headers.indexOf('Status');

    // Find row index to update
    let rowIndex = -1;
    if (idIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][idIdx]) === distributor.id) {
          rowIndex = i + 1; // 1-indexed and header-inclusive
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ID') return record.id;
      if (h === 'Name') return record.name;
      if (h === 'Identity ID') return record.identityId;
      if (h === 'Area IDs') return record.areaIds.join(',');
      if (h === 'Status') return record.status;
      return '';
    });

    if (rowIndex !== -1) {
      // Update existing
      this.writer.updateRange(this.sheetName, rowIndex, 1, [rowValues]);
    } else {
      // Append new
      if (rows.length === 0) {
        this.writer.appendRows(this.sheetName, [headers, rowValues]);
      } else {
        this.writer.appendRows(this.sheetName, [rowValues]);
      }
    }
  }
}
