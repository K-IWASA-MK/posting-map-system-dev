export interface AIOrganizationProfile {
  readonly organizationName: string;
  readonly organizationType: string;
  readonly description: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
