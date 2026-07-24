export class BrowserPageManager {
  private currentUrl: string = 'about:blank';
  private pageTitle: string = 'Blank Page';

  public async navigateTo(url: string): Promise<boolean> {
    this.currentUrl = url;
    this.pageTitle = 'Application View';
    return true;
  }

  public getCurrentUrl(): string {
    return this.currentUrl;
  }

  public getPageTitle(): string {
    return this.pageTitle;
  }
}
