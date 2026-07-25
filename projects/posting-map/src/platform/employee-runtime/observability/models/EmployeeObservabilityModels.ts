/**
 * AIOS Employee Observability Foundation
 * Domain Models for Events, Metrics, Snapshots, and Alerts
 */

export type ObservabilityEventType =
  | 'GOVERNANCE_EVENT'
  | 'TASK_ASSIGNMENT_EVENT'
  | 'EXECUTION_EVENT'
  | 'RESULT_EVENT'
  | 'LEARNING_EVENT'
  | 'KNOWLEDGE_ACCESS_EVENT';

export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlertStatus = 'DETECTED' | 'REVIEW_REQUIRED' | 'RESOLVED';

export interface RuntimeEvent {
  readonly eventId: string;
  readonly eventType: ObservabilityEventType;
  readonly sourceComponent: string;
  readonly payload: Readonly<Record<string, any>>;
  readonly timestamp: string;
}

export interface MetricRecord {
  readonly metricId: string;
  readonly metricName: string;
  readonly value: number;
  readonly unit: string;
  readonly timestamp: string;
}

export interface AlertRecord {
  readonly alertId: string;
  readonly alertType: string;
  readonly message: string;
  readonly severity: AlertSeverity;
  status: AlertStatus; // Resolved only via human review
  readonly detectedAt: string;
}

export interface StateSnapshot {
  readonly snapshotId: string;
  readonly employeeId: string;
  readonly employeeStatus: string;
  readonly currentTaskId: string | null;
  readonly executionStatus: string | null;
  readonly lastResultStatus: string | null;
  readonly knowledgeAccessCount: number;
  readonly timestamp: string;
}

export interface ObservationRecord {
  readonly observationId: string;
  readonly employeeId: string;
  readonly taskId: string;
  readonly executionId: string;
  readonly resultId: string;
  readonly eventType: ObservabilityEventType;
  readonly timestamp: string;
}

export interface DashboardOverviewData {
  readonly totalEmployees: number;
  readonly totalTasks: number;
  readonly activeExecutions: number;
  readonly verifiedResults: number;
  readonly totalKnowledgeReferences: number;
  readonly generatedAt: string;
}
