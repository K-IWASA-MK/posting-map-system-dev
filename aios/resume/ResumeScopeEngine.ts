import { ResumeScopeDefinition } from "./ResumeScopeDefinition";
import { ResumeContext } from "./ResumeContext";

export interface IResumeScopeEngine {
  initialize(context: ResumeContext): Promise<boolean>;
  resolveScope(phase: string): Promise<ResumeScopeDefinition | null>;
  validateAccess(path: string, context: ResumeContext): Promise<boolean>;
  lockScope(phase: string): Promise<boolean>;
}

export abstract class BaseResumeScopeEngine implements IResumeScopeEngine {
  abstract initialize(context: ResumeContext): Promise<boolean>;
  abstract resolveScope(phase: string): Promise<ResumeScopeDefinition | null>;
  abstract validateAccess(path: string, context: ResumeContext): Promise<boolean>;
  abstract lockScope(phase: string): Promise<boolean>;
}
