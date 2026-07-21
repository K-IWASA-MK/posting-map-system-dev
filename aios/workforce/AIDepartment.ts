import { AIDepartmentProfile } from './AIDepartmentProfile';
import { AIDepartmentMember } from './AIDepartmentMember';

export interface AIDepartment {
  readonly departmentId: string;
  readonly profile: AIDepartmentProfile;
  readonly members: readonly AIDepartmentMember[];
  readonly version: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
