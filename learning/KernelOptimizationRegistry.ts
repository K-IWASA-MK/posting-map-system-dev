import { OptimizationCandidate } from "./OptimizationVector";

export class KernelOptimizationRegistry {
  private candidates: Map<string, OptimizationCandidate> = new Map();

  public async addCandidate(candidate: OptimizationCandidate): Promise<boolean> {
    if (this.candidates.has(candidate.id)) {
      return false;
    }
    this.candidates.set(candidate.id, candidate);
    return true;
  }

  public async findCandidate(id: string): Promise<OptimizationCandidate | null> {
    return this.candidates.get(id) || null;
  }

  public async listCandidates(): Promise<OptimizationCandidate[]> {
    return Array.from(this.candidates.values());
  }

  public async removeCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }
}
