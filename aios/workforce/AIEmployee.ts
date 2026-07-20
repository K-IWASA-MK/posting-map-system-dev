import { AIEmployeeProfile } from './AIEmployeeProfile';
import { AIEmployeeCapability } from './AIEmployeeCapability';
import { AIEmployeeStatus } from './AIEmployeeStatus';

export interface AIEmployee {
  readonly employeeId: string;
  readonly profile: AIEmployeeProfile;
  readonly capability: AIEmployeeCapability;
  readonly status: AIEmployeeStatus;
}
