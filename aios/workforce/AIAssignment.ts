import { AIAssignmentProfile } from './AIAssignmentProfile';
import { AIAssignmentTarget } from './AIAssignmentTarget';

export interface AIAssignment {
  readonly assignmentId: string;
  readonly profile: AIAssignmentProfile;
  readonly target: AIAssignmentTarget;
  readonly employeeId: string;
  readonly roleId: string;
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
