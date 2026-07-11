import { IWorkspaceRepository } from '@domain/workspace/repositories/IWorkspaceRepository';
import { Workspace, WorkspaceStatus } from '@domain/workspace/entities/Workspace';
import { SpreadsheetReader } from '../../spreadsheet/SpreadsheetReader';
import { SpreadsheetWriter } from '../../spreadsheet/SpreadsheetWriter';

export class SpreadsheetWorkspaceRepository implements IWorkspaceRepository {
  private reader: SpreadsheetReader;
  private writer: SpreadsheetWriter;
  private sheetName = 'Workspaces';

  constructor() {
    this.reader = new SpreadsheetReader();
    this.writer = new SpreadsheetWriter();
  }

  public async findById(id: string): Promise<Workspace | undefined> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return undefined;

    const headers = rows[0];
    const wsIdIdx = headers.indexOf('ワークスペースID');
    const nameIdx = headers.indexOf('ワークスペース名');
    const statusIdx = headers.indexOf('ステータス');

    if (wsIdIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[wsIdIdx]) === id) {
        return new Workspace({
          workspaceId: String(row[wsIdIdx]),
          workspaceName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          status: statusIdx !== -1 ? (String(row[statusIdx]).toUpperCase() as WorkspaceStatus) : 'ACTIVE'
        });
      }
    }
    return undefined;
  }

  public async findAll(): Promise<Workspace[]> {
    const rows = this.reader.readAll(this.sheetName);
    if (rows.length <= 1) return [];

    const headers = rows[0];
    const wsIdIdx = headers.indexOf('ワークスペースID');
    const nameIdx = headers.indexOf('ワークスペース名');
    const statusIdx = headers.indexOf('ステータス');

    if (wsIdIdx === -1) return [];

    const list: Workspace[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[wsIdIdx]) {
        list.push(new Workspace({
          workspaceId: String(row[wsIdIdx]),
          workspaceName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          status: statusIdx !== -1 ? (String(row[statusIdx]).toUpperCase() as WorkspaceStatus) : 'ACTIVE'
        }));
      }
    }
    return list;
  }

  public async save(workspace: Workspace): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['ワークスペースID', 'ワークスペース名', 'ステータス'];

    const wsIdIdx = headers.indexOf('ワークスペースID');

    let rowIndex = -1;
    if (wsIdIdx !== -1) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][wsIdIdx]) === workspace.workspaceId) {
          rowIndex = i + 1;
          break;
        }
      }
    }

    const rowValues = headers.map(h => {
      if (h === 'ワークスペースID') return workspace.workspaceId;
      if (h === 'ワークスペース名') return workspace.workspaceName;
      if (h === 'ステータス') return workspace.getStatus();
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
