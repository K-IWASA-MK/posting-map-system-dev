import { PolicyBundle, PolicyDefinition } from './GovernanceModels';

export class GovernanceRegistry {
  private activeBundle?: PolicyBundle;
  private bundleHistory = new Map<string, PolicyBundle>();

  public registerBundle(bundle: PolicyBundle): void {
    const computedChecksum = this.calculateChecksum(bundle.policies);
    if (bundle.checksum !== computedChecksum) {
      throw new Error(`GovernanceRegistry Checksum mismatch: Expected ${bundle.checksum}, computed ${computedChecksum}`);
    }
    this.bundleHistory.set(bundle.version, bundle);
  }

  public activateBundle(version: string): void {
    const bundle = this.bundleHistory.get(version);
    if (!bundle) {
      throw new Error(`GovernanceRegistry: Policy bundle version ${version} not registered`);
    }
    this.activeBundle = bundle;
  }

  public getActiveBundle(): PolicyBundle | undefined {
    return this.activeBundle;
  }

  public getHistory(): PolicyBundle[] {
    return Array.from(this.bundleHistory.values());
  }

  public rollbackTo(version: string): void {
    this.activateBundle(version);
  }

  public calculateChecksum(policies: PolicyDefinition[]): string {
    let data = '';
    // Sort policies by priority and ID to ensure deterministic checksum
    const sorted = [...policies].sort((a, b) => a.priority - b.priority || a.policyId.localeCompare(b.policyId));
    sorted.forEach(p => {
      data += `${p.policyId}:${p.version}:${p.state}`;
    });
    
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = (hash << 5) - hash + data.charCodeAt(i);
      hash |= 0;
    }
    return `CS-${Math.abs(hash)}`;
  }
}
