/**
 * SupervisorCommand.ts
 * 
 * Command types issued by Supervisors
 */

export enum SupervisorCommandType {
  INTAKE = 'INTAKE',
  DELEGATE = 'DELEGATE',
  DIRECT = 'DIRECT',
  MONITOR = 'MONITOR',
  VERIFY = 'VERIFY',
  REPORT = 'REPORT'
}

export interface SupervisorCommand {
  commandId: string;
  commandType: SupervisorCommandType;
  supervisorId: string;
  targetWorkerId?: string;
  taskId: string;
  issuedAt: string;
  payload: Record<string, any>;
}
