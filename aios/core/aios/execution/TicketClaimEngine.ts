export class TicketClaimEngine {
  private claimedTickets: Set<string> = new Set();

  public claimTicket(ticketId: string): boolean {
    if (this.claimedTickets.has(ticketId)) {
      return false; // Prevent double claim
    }
    this.claimedTickets.add(ticketId);
    return true;
  }
}
