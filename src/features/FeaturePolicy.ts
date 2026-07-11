import { Edition } from '../licensing/Edition';
import { Role } from '../authorization/Role';
import { Permission } from '../authorization/Permission';
import { Scope } from '../authorization/Scope';

export class FeaturePolicy {
  public readonly requiredEdition: Edition;
  public readonly requiredRole: Role | null;
  public readonly requiredPermission: Permission | null;
  public readonly requiredScope: Scope | null;
  public readonly featureToggle: string | null;

  constructor(params: {
    requiredEdition?: Edition;
    requiredRole?: Role | null;
    requiredPermission?: Permission | null;
    requiredScope?: Scope | null;
    featureToggle?: string | null;
  }) {
    this.requiredEdition = params.requiredEdition || Edition.COMMUNITY;
    this.requiredRole = params.requiredRole || null;
    this.requiredPermission = params.requiredPermission || null;
    this.requiredScope = params.requiredScope || null;
    this.featureToggle = params.featureToggle || null;
  }
}
