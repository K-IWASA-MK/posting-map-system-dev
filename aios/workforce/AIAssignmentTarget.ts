export interface AIAssignmentTarget {
  readonly targetId: string;
  readonly targetType: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
