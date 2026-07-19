import { FederationTrustEvidence } from '../FederationModels';

export class DomainTrustRegistry {
  private evidenceStore = new Map<string, FederationTrustEvidence[]>();
  private trustCache = new Map<string, number>(); // domainId -> trustScore

  public addEvidence(evidence: FederationTrustEvidence): void {
    const list = this.evidenceStore.get(evidence.domainId) || [];
    list.push(evidence);
    this.evidenceStore.set(evidence.domainId, list);
  }

  public getEvidence(domainId: string): FederationTrustEvidence[] {
    return this.evidenceStore.get(domainId) || [];
  }

  public cacheScore(domainId: string, score: number): void {
    this.trustCache.set(domainId, score);
  }

  public getCachedScore(domainId: string): number | undefined {
    return this.trustCache.get(domainId);
  }

  public invalidateCache(domainId: string): void {
    this.trustCache.delete(domainId);
  }

  public clearAll(): void {
    this.trustCache.clear();
  }
}
