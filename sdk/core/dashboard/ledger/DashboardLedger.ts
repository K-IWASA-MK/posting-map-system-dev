export class DashboardLedger {
  // Ledger handles specific persistence or formatted logging for dashboard actions
  // The actual state projection of the execution ledger is kept in DashboardRegistry
  
  public recordAccess(ip: string, endpoint: string): void {
    // console.log(`[DashboardLedger] Access to ${endpoint} from ${ip}`);
  }

  public recordStateUpdate(type: string, id: string): void {
    // console.log(`[DashboardLedger] Updated projection for ${type} ${id}`);
  }
}
