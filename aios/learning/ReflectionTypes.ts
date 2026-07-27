export interface StructuredReflection {
  readonly reflectionId: string;
  readonly executionId: string;
  readonly taskId: string;
  readonly employeeId: string;
  readonly projectId: string;
  readonly observation: string;   // What happened
  readonly cause: string;         // Why it happened
  readonly pattern: string;       // Pattern identified
  readonly futureRule: string;    // Actionable rule for future
  readonly confidence: number;   // 0.0 - 1.0
}

export interface PersonalLesson {
  readonly lessonId: string;
  readonly category: "SUCCESS_PATTERN" | "FAILURE_RECOVERY" | "CONFIG_GOTCHA";
  readonly reflection: StructuredReflection;
  readonly evidenceTaskIds: readonly string[]; // Diverse task IDs
  readonly evidenceCount: number;
  readonly confidence: number;
  readonly timestamp: number;
}
