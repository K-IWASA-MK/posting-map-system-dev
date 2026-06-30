import { AutonomousReviewRuntimeDefinition } from "./AutonomousReviewRuntimeDefinition";
import { AutonomousReviewRuntimeContext } from "./AutonomousReviewRuntimeContext";

export interface IAutonomousReviewRuntimeEngine {
  register(definition: AutonomousReviewRuntimeDefinition, context: AutonomousReviewRuntimeContext): Promise<boolean>;
  execute(id: string, context: AutonomousReviewRuntimeContext, dryRun?: boolean): Promise<boolean>;
  resolve(id: string, context: AutonomousReviewRuntimeContext): Promise<AutonomousReviewRuntimeDefinition | null>;
  list(context: AutonomousReviewRuntimeContext): Promise<AutonomousReviewRuntimeDefinition[]>;
}

export abstract class BaseAutonomousReviewRuntimeEngine implements IAutonomousReviewRuntimeEngine {
  abstract register(definition: AutonomousReviewRuntimeDefinition, context: AutonomousReviewRuntimeContext): Promise<boolean>;
  abstract execute(id: string, context: AutonomousReviewRuntimeContext, dryRun?: boolean): Promise<boolean>;
  abstract resolve(id: string, context: AutonomousReviewRuntimeContext): Promise<AutonomousReviewRuntimeDefinition | null>;
  abstract list(context: AutonomousReviewRuntimeContext): Promise<AutonomousReviewRuntimeDefinition[]>;
}
