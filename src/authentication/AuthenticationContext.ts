export type IdentityType = 'USER' | 'SERVICE' | 'ANONYMOUS';

export const IdentityType = {
  USER: 'USER' as IdentityType,
  SERVICE: 'SERVICE' as IdentityType,
  ANONYMOUS: 'ANONYMOUS' as IdentityType
};

export type AuthenticationMethod = 'API_KEY' | 'LIFF' | 'INTERNAL_SERVICE' | 'NONE';

export const AuthenticationMethod = {
  API_KEY: 'API_KEY' as AuthenticationMethod,
  LIFF: 'LIFF' as AuthenticationMethod,
  INTERNAL_SERVICE: 'INTERNAL_SERVICE' as AuthenticationMethod,
  NONE: 'NONE' as AuthenticationMethod
};

export interface AuthenticationMetadata {
  readonly issuer?: string;
  readonly provider?: string;
  readonly clientVersion?: string;
  readonly requestSource?: string;
  readonly [key: string]: any;
}

export class AuthenticationContext {
  public readonly identityId: string;
  public readonly identityType: IdentityType;
  public readonly authenticationMethod: AuthenticationMethod;
  public readonly authenticated: boolean;
  public readonly issuedAt: number;
  public readonly metadata: AuthenticationMetadata;

  constructor(params: {
    identityId: string;
    identityType: IdentityType;
    authenticationMethod: AuthenticationMethod;
    authenticated: boolean;
    issuedAt: number;
    metadata?: AuthenticationMetadata;
  }) {
    this.identityId = params.identityId;
    this.identityType = params.identityType;
    this.authenticationMethod = params.authenticationMethod;
    this.authenticated = params.authenticated;
    this.issuedAt = params.issuedAt;
    this.metadata = params.metadata || {};
  }
}
