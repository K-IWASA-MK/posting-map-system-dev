import { PolicyContext } from "./PolicyContext";
import { PolicyProfile } from "./PolicyProfile";

export interface PolicyRule {
  readonly id: string;
  readonly priority: number;
  readonly precedence: "HIGH" | "NORMAL" | "LOW";
  readonly exclusive: boolean;
  readonly dependencies: string[];
  
  evaluate(context: PolicyContext): PolicyProfile | null;
}
