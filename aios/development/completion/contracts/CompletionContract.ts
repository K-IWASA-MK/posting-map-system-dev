export interface CompletionRequest {
  readonly sprintId: string;
  readonly phase: string;
  readonly implementationStatus: "COMPLETED" | "IN_PROGRESS" | "FAILED";
  readonly testResult: {
    readonly passed: number;
    readonly failed: number;
    readonly total: number;
    readonly qualityGate?: "PASS" | "FAIL"; // Quality Gate check integration
  };
  readonly changedFiles: readonly string[];
  readonly commitMessage: string;
  readonly handoverFilePath?: string; // Custom path override for local/test validation
}
