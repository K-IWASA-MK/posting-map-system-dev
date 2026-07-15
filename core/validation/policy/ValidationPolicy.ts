export interface ValidationPolicy {
  id: string;
  version: string;
  requireAllPassing: boolean;
  failFast: boolean; // if true, stop DAG immediately on first CRITICAL failure
  defaultTimeoutMs: number;
}
