/**
 * CallbackAuthenticator.ts
 * Interface for authenticating incoming callback requests.
 */
import { CallbackContext } from './CallbackContext';

export interface CallbackAuthenticator {
  authenticate(context: CallbackContext, payload: unknown): boolean;
}
