import { ResumeScope } from "./ResumeScope";

export interface ResumeScopeDefinition {
  id: string;
  phase: string;
  scope: ResumeScope;
  rules: string[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    author: string;
  };
}
