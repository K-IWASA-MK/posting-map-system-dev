import { GovernanceRequest } from "./GovernanceRequest";

export class GovernanceKernelRegistry {
  private requests: Map<string, GovernanceRequest> = new Map();

  public async addRequest(request: GovernanceRequest): Promise<boolean> {
    if (this.requests.has(request.requestId)) {
      return false;
    }
    this.requests.set(request.requestId, request);
    return true;
  }

  public async findRequest(id: string): Promise<GovernanceRequest | null> {
    return this.requests.get(id) || null;
  }

  public async listRequests(): Promise<GovernanceRequest[]> {
    return Array.from(this.requests.values());
  }

  public async removeRequest(id: string): Promise<boolean> {
    return this.requests.delete(id);
  }
}
