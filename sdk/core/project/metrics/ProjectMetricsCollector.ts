import { Project, ProjectEntityState } from '../ProjectModels';

export interface ProjectMetrics {
  velocity: number;
  leadTime: number;
  cycleTime: number;
  taskCompletionRate: number;
  backlogSize: number;
  completedIssues: number;
}

export class ProjectMetricsCollector {
  public collectMetrics(project: Project): ProjectMetrics {
    const allIssues = [...project.backlog.issues, ...project.sprints.flatMap(s => s.issues)];
    const completedIssues = allIssues.filter(i => i.state === ProjectEntityState.COMPLETED);
    const completedTasks = allIssues.flatMap(i => i.tasks).filter(t => t.state === ProjectEntityState.COMPLETED);
    const totalTasks = allIssues.flatMap(i => i.tasks);

    const taskCompletionRate = totalTasks.length > 0 ? completedTasks.length / totalTasks.length : 0;
    
    // Simplistic velocity based on completed issues
    const velocity = completedIssues.length; 

    return {
      velocity,
      leadTime: 0, // Placeholder
      cycleTime: 0, // Placeholder
      taskCompletionRate,
      backlogSize: project.backlog.issues.length,
      completedIssues: completedIssues.length
    };
  }
}
