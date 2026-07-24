import { BrowserConfiguration } from './BrowserConfiguration';
import { CDPConnectionException } from './exceptions/BrowserRuntimeExceptions';

export class CDPConnectionManager {
  private connected: boolean = false;
  private endpoint: string = BrowserConfiguration.DEFAULT_CDP_ENDPOINT;

  public async connect(endpoint: string = BrowserConfiguration.DEFAULT_CDP_ENDPOINT): Promise<boolean> {
    if (!endpoint) {
      throw new CDPConnectionException('CDP Endpoint URL cannot be null or empty.');
    }
    this.endpoint = endpoint;
    this.connected = true;
    return true;
  }

  public async disconnect(): Promise<void> {
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getEndpoint(): string {
    return this.endpoint;
  }
}
