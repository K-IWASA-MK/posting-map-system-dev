import { EvolutionCandidate } from "./EvolutionCandidate";

export class EvolutionRegistry {
  private candidates: Map<string, EvolutionCandidate> = new Map();

  public async addCandidate(candidate: EvolutionCandidate): Promise<boolean> {
    if (this.candidates.has(candidate.id)) {
      return false;
    }
    this.candidates.set(candidate.id, candidate);
    return true;
  }

  public async findCandidate(id: string): Promise<EvolutionCandidate | null> {
    return this.candidates.get(id) || null;
  }

  public async listCandidates(): Promise<EvolutionCandidate[]> {
    return Array.from(this.candidates.values());
  }

  public async removeCandidate(id: string): Promise<boolean> {
    return this.candidates.delete(id);
  }
}
