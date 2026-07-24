export interface BrowserSessionModel {
  lineSession: {
    loggedIn: boolean;
    userId: string | null;
    displayName: string | null;
  };
  googleSession: {
    loggedIn: boolean;
    email: string | null;
  };
  cookies: Record<string, string>;
  localStorage: Record<string, string>;
  indexedDb: Record<string, any>;
  sessionValid: boolean;
  expiration: string | null;
  lastVerifiedAt: string;
}
