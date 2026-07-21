export interface AIWorkforceContext {
  readonly employeeId: string;
  readonly roleId: string;
  readonly assignmentId: string;
  readonly organizationId?: string;
  readonly departmentId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
