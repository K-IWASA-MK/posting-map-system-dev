import { AIEmployee } from './AIEmployee';

export interface AIEmployeeRegistry {
  readonly registryId: string;
  readonly employees: readonly AIEmployee[];
  readonly version: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}
