import { AIOrganization } from './AIOrganization';
import { AIOrganizationRequest } from './AIOrganizationRequest';
import { AIOrganizationResponse } from './AIOrganizationResponse';

export interface AIOrganizationProvider {
  registerOrganization(request: AIOrganizationRequest): AIOrganizationResponse;
  getOrganization(organizationId: string): AIOrganizationResponse;
  listOrganizations(): readonly AIOrganization[];
}
