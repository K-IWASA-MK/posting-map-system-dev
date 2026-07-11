import { AuthenticationContext } from '../authentication/AuthenticationContext';

export interface Resolver<T> {
  resolve(authContext: AuthenticationContext): T;
}
