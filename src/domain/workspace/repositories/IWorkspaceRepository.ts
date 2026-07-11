import { Workspace } from '../entities/Workspace';

export interface IWorkspaceRepository {
  findById(id: string): Promise<Workspace | undefined>;
  save(workspace: Workspace): Promise<void>;
}
