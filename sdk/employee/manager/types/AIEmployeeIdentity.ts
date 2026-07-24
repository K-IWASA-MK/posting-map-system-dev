export interface AIEmployeeIdentity {
  employeeId: string;
  employeeName: string;
  employeeType: 'AGENT' | 'SUPERVISOR' | 'SYSTEM';
  version: string;
  createdAt: string;
}
