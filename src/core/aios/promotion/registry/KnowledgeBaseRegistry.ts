export class KnowledgeBaseRegistry {
  private registeredDomains: Set<string> = new Set();
  
  public registerDomain(domain: string): void {
    this.registeredDomains.add(domain);
  }
  
  public hasDomain(domain: string): boolean {
    return this.registeredDomains.has(domain);
  }
  
  public listDomains(): string[] {
    return Array.from(this.registeredDomains);
  }
}
