import { ISessionIdProvider } from './ISessionIdProvider';
import { randomUUID } from 'crypto';

/**
 * SessionIdProvider implements ISessionIdProvider producing standard v4 UUIDs.
 */
export class SessionIdProvider implements ISessionIdProvider {
  public generateSessionId(): string {
    return randomUUID();
  }
}
