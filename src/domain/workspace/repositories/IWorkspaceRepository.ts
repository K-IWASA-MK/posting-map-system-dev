import { Workspace } from '../entities/Workspace';

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | undefined>;
  findAll(): Promise<Workspace[]>;
  save(workspace: Workspace): Promise<void>;
}
