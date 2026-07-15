export interface CoordinationInstruction {
  readonly instructionId: string;
  readonly targetRuntime: string;
  readonly command: string;
  readonly payload: any;
  readonly traceId: string;
}
