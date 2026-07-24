export interface IBrowserPoolRouter {
  getAvailableNode(): string;
  releaseNode(nodeId: string): void;
  poolSize(): number;
}

export class DefaultBrowserPoolRouter implements IBrowserPoolRouter {
  public getAvailableNode(): string {
    return 'node-primary-cdp-9222';
  }

  public releaseNode(nodeId: string): void {}

  public poolSize(): number {
    return 1;
  }
}
