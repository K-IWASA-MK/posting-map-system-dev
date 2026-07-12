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
    const goalIdx = headers.indexOf('月間配布目標');
    const updatedAtIdx = headers.indexOf('目標更新日時');
    const updatedByIdx = headers.indexOf('最終更新者');

    if (wsIdIdx === -1) return undefined;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (String(row[wsIdIdx]) === id) {
        const goalVal = goalIdx !== -1 && row[goalIdx] !== undefined && row[goalIdx] !== '' ? Number(row[goalIdx]) : null;
        return new Workspace({
          workspaceId: String(row[wsIdIdx]),
          workspaceName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          status: statusIdx !== -1 ? (String(row[statusIdx]).toUpperCase() as WorkspaceStatus) : 'ACTIVE',
          distributionGoal: goalVal,
          goalUpdatedAt: updatedAtIdx !== -1 && row[updatedAtIdx] !== undefined ? String(row[updatedAtIdx]) : null,
          goalUpdatedBy: updatedByIdx !== -1 && row[updatedByIdx] !== undefined ? String(row[updatedByIdx]) : null
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
    const goalIdx = headers.indexOf('月間配布目標');
    const updatedAtIdx = headers.indexOf('目標更新日時');
    const updatedByIdx = headers.indexOf('最終更新者');

    if (wsIdIdx === -1) return [];

    const list: Workspace[] = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[wsIdIdx]) {
        const goalVal = goalIdx !== -1 && row[goalIdx] !== undefined && row[goalIdx] !== '' ? Number(row[goalIdx]) : null;
        list.push(new Workspace({
          workspaceId: String(row[wsIdIdx]),
          workspaceName: nameIdx !== -1 ? String(row[nameIdx]) : '',
          status: statusIdx !== -1 ? (String(row[statusIdx]).toUpperCase() as WorkspaceStatus) : 'ACTIVE',
          distributionGoal: goalVal,
          goalUpdatedAt: updatedAtIdx !== -1 && row[updatedAtIdx] !== undefined ? String(row[updatedAtIdx]) : null,
          goalUpdatedBy: updatedByIdx !== -1 && row[updatedByIdx] !== undefined ? String(row[updatedByIdx]) : null
        }));
      }
    }
    return list;
  }

  public async save(workspace: Workspace): Promise<void> {
    const rows = this.reader.readAll(this.sheetName);
    const headers = rows.length > 0 ? rows[0] : ['ワークスペースID', 'ワークスペース名', 'ステータス', '月間配布目標', '目標更新日時', '最終更新者'];

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
      if (h === '月間配布目標') return workspace.getDistributionGoal() !== null ? workspace.getDistributionGoal() : '';
      if (h === '目標更新日時') return workspace.getGoalUpdatedAt() || '';
      if (h === '最終更新者') return workspace.getGoalUpdatedBy() || '';
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
