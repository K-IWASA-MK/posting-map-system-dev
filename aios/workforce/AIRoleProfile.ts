export interface AIRoleProfile {
  readonly roleName: string;
  readonly roleType: string;
  readonly description: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
