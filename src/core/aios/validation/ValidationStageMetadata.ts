import { ValidationStageType } from './ValidationStageType';

export interface ValidationStageMetadata {
  readonly type: ValidationStageType;
  readonly name: string;
  readonly priority: number;
  readonly dependencies: readonly ValidationStageType[];
  readonly canSkip: boolean;
  readonly estimatedCost: number;
}
