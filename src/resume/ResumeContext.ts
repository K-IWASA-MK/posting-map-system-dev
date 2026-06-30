export interface ResumeContext {
  currentPhase: string;
  allowedPaths: string[];
  forbiddenPaths: string[];
  entryPoint: string;
  executionMode: string;
}
