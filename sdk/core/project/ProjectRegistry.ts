import { Project } from './ProjectModels';

export interface ProjectRegistry {
  register(project: Project): void;
  getById(projectId: string): Project | undefined;
  update(projectId: string, updates: Partial<Project>): void;
}

export class InMemoryProjectRegistry implements ProjectRegistry {
  private projects = new Map<string, Project>();

  public register(project: Project): void {
    if (this.projects.has(project.id)) {
      throw new Error(`Project ${project.id} already exists`);
    }
    this.projects.set(project.id, project);
  }

  public getById(projectId: string): Project | undefined {
    return this.projects.get(projectId);
  }

  public update(projectId: string, updates: Partial<Project>): void {
    const project = this.projects.get(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    this.projects.set(projectId, { ...project, ...updates });
  }
}
