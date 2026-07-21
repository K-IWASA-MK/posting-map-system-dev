import { AIDepartment } from './AIDepartment';
import { AIDepartmentRequest } from './AIDepartmentRequest';
import { AIDepartmentResponse } from './AIDepartmentResponse';

export interface AIDepartmentProvider {
  registerDepartment(request: AIDepartmentRequest): AIDepartmentResponse;
  getDepartment(departmentId: string): AIDepartmentResponse;
  listDepartments(): readonly AIDepartment[];
}
