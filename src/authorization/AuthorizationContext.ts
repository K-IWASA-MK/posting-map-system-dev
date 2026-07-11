import { Role } from './Role';
import { Permission } from './Permission';
import { Scope } from './Scope';

export interface AuthorizationMetadata {
  readonly evaluatedPolicy?: string;
  readonly decisionSource?: string;
  readonly evaluationTime?: number;
  readonly [key: string]: any;
}

export class AuthorizationContext {
  public readonly role: Role;
  public readonly permissions: Permission[];
  public readonly scopes: Scope[];
  public readonly authorized: boolean;
  public readonly metadata: AuthorizationMetadata;

  constructor(params: {
    role: Role;
    permissions: Permission[];
    scopes: Scope[];
    authorized: boolean;
    metadata?: AuthorizationMetadata;
  }) {
    this.role = params.role;
    this.permissions = params.permissions;
    this.scopes = params.scopes;
    this.authorized = params.authorized;
    this.metadata = params.metadata || {};
  }
}
