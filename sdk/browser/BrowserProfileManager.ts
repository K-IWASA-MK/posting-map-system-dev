import { BrowserConfiguration } from './BrowserConfiguration';
import { ProfileViolationException } from './exceptions/BrowserRuntimeExceptions';

export class BrowserProfileManager {
  private activeProfile: string = BrowserConfiguration.ALLOWED_PROFILE_NAME;

  public getActiveProfile(): string {
    return this.activeProfile;
  }

  public validateProfile(profileName: string): boolean {
    if (BrowserConfiguration.FORBIDDEN_PROFILES.some(p => profileName.includes(p))) {
      throw new ProfileViolationException(`Access to profile '${profileName}' is strictly prohibited by Rule BR-002.`);
    }
    if (profileName !== BrowserConfiguration.ALLOWED_PROFILE_NAME) {
      throw new ProfileViolationException(`AI Employees must ONLY use '${BrowserConfiguration.ALLOWED_PROFILE_NAME}'. Requested: '${profileName}'.`);
    }
    return true;
  }
}
