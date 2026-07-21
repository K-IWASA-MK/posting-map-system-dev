import { AIOrganizationProfile } from './AIOrganizationProfile';
import { AIOrganizationDepartment } from './AIOrganizationDepartment';

export interface AIOrganization {
  readonly organizationId: string;
  readonly profile: AIOrganizationProfile;
  readonly departments: readonly AIOrganizationDepartment[];
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
