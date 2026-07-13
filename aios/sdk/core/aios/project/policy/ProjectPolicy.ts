export interface ProjectPolicy {
  sprintDurationDays: number;
  maxTasksPerIssue: number;
  requireEpicForIssue: boolean;
}

export const DefaultProjectPolicy: ProjectPolicy = {
  sprintDurationDays: 14,
  maxTasksPerIssue: 10,
  requireEpicForIssue: false
};
