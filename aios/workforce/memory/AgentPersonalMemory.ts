import { PersonalLesson } from '../../learning/ReflectionTypes';

export interface AgentPersonalMemory {
  readonly employeeId: string;
  readonly memoryVersion: number; // Memory versioning for future migration/cleanup
  readonly totalCompletedTasks: number;
  readonly successCount: number;
  readonly domainTaskCounts: Readonly<Record<string, number>>;
  readonly lessons: readonly PersonalLesson[];
  readonly lastActiveAt: number;
}
