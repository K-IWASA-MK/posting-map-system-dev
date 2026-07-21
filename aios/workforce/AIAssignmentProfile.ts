export interface AIAssignmentProfile {
  readonly assignmentName: string;
  readonly assignmentType: string;
  readonly description: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
