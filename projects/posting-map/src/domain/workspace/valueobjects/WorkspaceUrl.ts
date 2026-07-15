export class WorkspaceUrl {
  public readonly dashboardUrl: string;
  public readonly lineAppUrl: string;

  constructor(params: { dashboardUrl: string; lineAppUrl: string }) {
    if (!params.dashboardUrl || !this.isValidUrl(params.dashboardUrl)) {
      throw new Error(`Invalid dashboardUrl: ${params.dashboardUrl}`);
    }
    if (!params.lineAppUrl || !this.isValidUrl(params.lineAppUrl)) {
      throw new Error(`Invalid lineAppUrl: ${params.lineAppUrl}`);
    }
    this.dashboardUrl = params.dashboardUrl;
    this.lineAppUrl = params.lineAppUrl;
  }

  public static generate(workspaceId: string): WorkspaceUrl {
    const cleanId = encodeURIComponent(workspaceId);
    return new WorkspaceUrl({
      dashboardUrl: `https://posting-map.jp/dashboard/${cleanId}`,
      lineAppUrl: `https://liff.line.me/2010177345-tXZIMAJK/${cleanId}`
    });
  }

  private isValidUrl(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  public equals(other: WorkspaceUrl): boolean {
    return this.dashboardUrl === other.dashboardUrl && this.lineAppUrl === other.lineAppUrl;
  }
}
