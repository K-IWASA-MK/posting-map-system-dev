import { RewriteCandidate } from "./RewriteCandidate";

export class SafetyRegistry {
  private candidates: Map<string, RewriteCandidate> = new Map();

  public async register(candidate: RewriteCandidate): Promise<boolean> {
    if (this.candidates.has(candidate.id)) {
      return false;
    }
    this.candidates.set(candidate.id, candidate);
    return true;
  }

  public async find(id: string): Promise<RewriteCandidate | null> {
    return this.candidates.get(id) || null;
  }

  public async list(): Promise<RewriteCandidate[]> {
    return Array.from(this.candidates.values());
  }

  public async remove(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }
}
