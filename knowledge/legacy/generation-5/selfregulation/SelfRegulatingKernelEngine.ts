import { KernelLoadVector, KernelStateProfile, RegulationAction } from "./KernelLoadVector";

export interface ISelfRegulatingKernelEngine {
  initialize(): Promise<boolean>;
  monitor(): Promise<KernelLoadVector>;
  analyze(vector: KernelLoadVector): Promise<KernelStateProfile>;
  regulate(action: RegulationAction): Promise<boolean>;
  rebalance(context: Record<string, any>): Promise<boolean>;
}

export abstract class BaseSelfRegulatingKernelEngine implements ISelfRegulatingKernelEngine {
  abstract initialize(): Promise<boolean>;
  abstract monitor(): Promise<KernelLoadVector>;
  abstract analyze(vector: KernelLoadVector): Promise<KernelStateProfile>;
  abstract regulate(action: RegulationAction): Promise<boolean>;
  abstract rebalance(context: Record<string, any>): Promise<boolean>;
}
