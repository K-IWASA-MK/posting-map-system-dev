export interface AIEmployeeLookupRequest {
  readonly employeeId?: string;
  readonly capability?: string;
  readonly roleId?: string;
  readonly departmentId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
