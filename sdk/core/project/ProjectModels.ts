export enum ProjectEntityState {
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeId?: string;
  state: ProjectEntityState;
  createdAt: string;
  completedAt?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  state: ProjectEntityState;
  tasks: Task[];
  createdAt: string;
}

export interface Backlog {
  id: string;
  issues: Issue[];
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  state: ProjectEntityState;
  issues: Issue[];
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  state: ProjectEntityState;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  milestoneId?: string;
  state: ProjectEntityState;
}

export interface Roadmap {
  id: string;
  epics: Epic[];
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  state: ProjectEntityState;
  roadmap: Roadmap;
  backlog: Backlog;
  sprints: Sprint[];
  milestones: Milestone[];
  createdAt: string;
}
