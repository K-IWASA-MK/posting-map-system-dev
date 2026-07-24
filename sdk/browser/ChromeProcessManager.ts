import { BrowserConfiguration } from './BrowserConfiguration';

export class ChromeProcessManager {
  private cdpAvailable: boolean = true;

  public isCDPAvailable(): boolean {
    return this.cdpAvailable;
  }

  public getCDPEndpoint(): string {
    return BrowserConfiguration.DEFAULT_CDP_ENDPOINT;
  }

  public shouldLaunchNewProcess(): boolean {
    // Rule BR-001: If CDP Endpoint exists, launch is strictly forbidden.
    return !this.cdpAvailable;
  }
}
