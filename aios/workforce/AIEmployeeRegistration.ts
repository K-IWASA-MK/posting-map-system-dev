import { AIEmployee } from './AIEmployee';

export interface AIEmployeeRegistration {
  readonly registrationId: string;
  readonly employee: AIEmployee;
  readonly timestamp: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}
