import { BillingTransaction } from '../service/ServiceModels';

export class BillingTransactionRegistry {
  private transactions = new Map<string, BillingTransaction>();

  public recordTransaction(tx: BillingTransaction): void {
    this.transactions.set(tx.txId, tx);
  }

  public getTransaction(txId: string): BillingTransaction | undefined {
    return this.transactions.get(txId);
  }

  public getTransactions(): BillingTransaction[] {
    return Array.from(this.transactions.values());
  }
}
