export class BrowserContextManager {
  private activeContextId: string = 'ctx-app-001';

  public getActiveContextId(): string {
    return this.activeContextId;
  }

  public isContextValid(): boolean {
    return true;
  }
}
