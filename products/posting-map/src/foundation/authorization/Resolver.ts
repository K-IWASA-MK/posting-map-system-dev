import { AuthenticationContext } from '@foundation/authentication/AuthenticationContext';

export interface Resolver<T> {
  resolve(authContext: AuthenticationContext): T;
}
