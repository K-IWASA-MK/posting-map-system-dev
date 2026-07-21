export interface AIDepartmentProfile {
  readonly departmentName: string;
  readonly departmentType: string;
  readonly description: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
