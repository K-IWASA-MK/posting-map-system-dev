import { EvolutionContext } from "./EvolutionContext";
import { EvolutionCandidate } from "./EvolutionCandidate";

export interface ISelfEvolvingEngine {
  analyzeEvolution(context: EvolutionContext): Promise<EvolutionCandidate[]>;
  proposeEvolution(context: EvolutionContext): Promise<EvolutionCandidate>;
  simulateEvolution(candidate: EvolutionCandidate): Promise<Record<string, any>>;
  validateEvolution(candidate: EvolutionCandidate): Promise<boolean>;
}

export abstract class BaseSelfEvolvingEngine implements ISelfEvolvingEngine {
  abstract analyzeEvolution(context: EvolutionContext): Promise<EvolutionCandidate[]>;
  abstract proposeEvolution(context: EvolutionContext): Promise<EvolutionCandidate>;
  abstract simulateEvolution(candidate: EvolutionCandidate): Promise<Record<string, any>>;
  abstract validateEvolution(candidate: EvolutionCandidate): Promise<boolean>;
}
