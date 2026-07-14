export interface TaskAffinity {
  readonly runtime: string[];
  readonly node: string[];
  readonly plugin: string[];
  readonly gpu: string[];
  readonly memoryZone: string[];
}
