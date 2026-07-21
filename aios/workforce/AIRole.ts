import { AIRoleProfile } from './AIRoleProfile';
import { AIRoleResponsibility } from './AIRoleResponsibility';

export interface AIRole {
  readonly roleId: string;
  readonly profile: AIRoleProfile;
  readonly responsibilities: readonly AIRoleResponsibility[];
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
