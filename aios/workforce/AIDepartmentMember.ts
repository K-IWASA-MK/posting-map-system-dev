export interface AIDepartmentMember {
  readonly employeeId: string;
  readonly roleId: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
