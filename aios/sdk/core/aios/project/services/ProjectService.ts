import { Project, Sprint, Issue, Task, ProjectEntityState, Epic } from '../ProjectModels';
import { ProjectRegistry } from '../ProjectRegistry';

export class ProjectIssueService {
  constructor(private registry: ProjectRegistry) {}

  public createIssue(projectId: string, title: string, description: string): Issue {
    const project = this.registry.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const issue: Issue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      state: ProjectEntityState.NEW,
      tasks: [],
      createdAt: new Date().toISOString()
    };

    project.backlog.issues.push(issue);
    this.registry.update(projectId, { backlog: project.backlog });
    return issue;
  }

  public closeIssue(projectId: string, issueId: string): void {
    const project = this.registry.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const issue = project.backlog.issues.find(i => i.id === issueId) || 
                  project.sprints.flatMap(s => s.issues).find(i => i.id === issueId);
    
    if (!issue) throw new Error(`Issue ${issueId} not found`);
    issue.state = ProjectEntityState.COMPLETED;
    this.registry.update(projectId, project);
  }
}

export class ProjectSprintService {
  constructor(private registry: ProjectRegistry) {}

  public startSprint(projectId: string, name: string, goal: string, endDate: string): Sprint {
    const project = this.registry.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const sprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name,
      goal,
      startDate: new Date().toISOString(),
      endDate,
      state: ProjectEntityState.ACTIVE,
      issues: []
    };

    project.sprints.push(sprint);
    this.registry.update(projectId, { sprints: project.sprints });
    return sprint;
  }

  public completeSprint(projectId: string, sprintId: string): void {
    const project = this.registry.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const sprint = project.sprints.find(s => s.id === sprintId);
    if (!sprint) throw new Error(`Sprint ${sprintId} not found`);

    sprint.state = ProjectEntityState.COMPLETED;
    this.registry.update(projectId, { sprints: project.sprints });
  }
}
