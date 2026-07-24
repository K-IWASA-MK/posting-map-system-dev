export class BrowserConfiguration {
  public static readonly DEFAULT_CDP_PORT = 9222;
  public static readonly DEFAULT_CDP_ENDPOINT = 'ws://localhost:9222';
  public static readonly ALLOWED_PROFILE_NAME = 'AI Employee Profile';
  public static readonly FORBIDDEN_PROFILES = ['CEO Browser', 'Personal Profile'];
  public static readonly DEFAULT_TIMEOUT_MS = 30000;
  public static readonly EVIDENCE_STORAGE_SCHEME = 'scheme://storage/evidence/';
}
