export interface CompletionResult {
  readonly status: "SUCCESS" | "FAILED" | "BLOCKED" | "WARNING";
  readonly commitHash?: string;
  readonly pushStatus: "SUCCESS" | "FAILED" | "SKIPPED";
  readonly remoteSync: boolean;
  readonly handoverUpdated: boolean;
  readonly error?: string;
}
