import { EnvironmentVector } from "./EnvironmentVector";

export interface EnvironmentAnalyzer {
  analyze(): EnvironmentVector;
}
