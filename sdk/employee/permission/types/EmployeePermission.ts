/**
 * EmployeePermission.ts
 * 
 * Governance & Operational Permissions for AI Employees
 */

export enum EmployeePermission {
  CAN_CREATE_TASK = 'CAN_CREATE_TASK',
  CAN_ASSIGN = 'CAN_ASSIGN',
  CAN_DEPROVISION = 'CAN_DEPROVISION',
  CAN_REGISTER_HANDLER = 'CAN_REGISTER_HANDLER',
  CAN_DEPLOY = 'CAN_DEPLOY',
  CAN_APPROVE = 'CAN_APPROVE',
  CAN_EXECUTE = 'CAN_EXECUTE',
  CAN_VIEW = 'CAN_VIEW'
}
