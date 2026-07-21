export interface AIRoleResponsibility {
  readonly responsibilityId: string;
  readonly responsibilityName: string;
  readonly description?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
