import { AIAssignment } from './AIAssignment';
import { AIAssignmentRequest } from './AIAssignmentRequest';
import { AIAssignmentResponse } from './AIAssignmentResponse';

export interface AIAssignmentProvider {
  registerAssignment(request: AIAssignmentRequest): AIAssignmentResponse;
  getAssignment(assignmentId: string): AIAssignmentResponse;
  listAssignments(): readonly AIAssignment[];
}
