export interface AIWorkforceExecutionContext {
  readonly runtimeId: string;
  readonly assignmentId: string;
  readonly employeeId: string;
  readonly roleId: string;
  readonly organizationId?: string;
  readonly departmentId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
