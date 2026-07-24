export interface OrgStructure {
  departmentId: string; // e.g. "dept-field-ops"
  teamId: string;       // e.g. "team-monitoring"
  supervisorId?: string;// e.g. "emp-leader-001"
  priorityGroup: 'CORE' | 'SECONDARY' | 'BACKGROUND';
}
