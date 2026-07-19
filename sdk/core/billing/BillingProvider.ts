import { BillingProviderInfo } from '../service/ServiceModels';

export interface IBillingProvider {
  readonly info: BillingProviderInfo;
  charge(licenseeId: string, amount: number): Promise<boolean>;
  refund(txId: string): Promise<boolean>;
}

export class BillingProviderRegistry {
  private providers = new Map<string, IBillingProvider>();

  public registerProvider(provider: IBillingProvider): void {
    this.providers.set(provider.info.providerId, provider);
  }

  public getProvider(providerId: string): IBillingProvider | undefined {
    return this.providers.get(providerId);
  }

  public getProviders(): IBillingProvider[] {
    return Array.from(this.providers.values());
  }

  public removeProvider(providerId: string): void {
    this.providers.delete(providerId);
  }
}
