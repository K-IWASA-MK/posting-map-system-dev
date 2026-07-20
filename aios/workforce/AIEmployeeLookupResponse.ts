import { AIEmployee } from './AIEmployee';

export interface AIEmployeeLookupResponse {
  readonly employees: readonly AIEmployee[];
  readonly totalCount: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}
