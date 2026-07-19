export class BillingPolicy {
  public validateBillingRequest(amount: number): boolean {
    if (amount <= 0) {
      return false;
    }
    return true;
  }
}
