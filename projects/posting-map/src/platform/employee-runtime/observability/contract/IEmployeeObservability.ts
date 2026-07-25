/**
 * AIOS Employee Observability Foundation
 * Abstraction Interfaces for Event Collector, Metric Engine, Alert Engine, Data Provider, and Observability Engine
 */

import {
  AlertRecord,
  DashboardOverviewData,
  MetricRecord,
  ObservationRecord,
  RuntimeEvent,
  StateSnapshot,
} from '../models/EmployeeObservabilityModels';

export interface IEventCollector {
  collectEvent(event: RuntimeEvent): ObservationRecord;
  getEvents(eventType?: string): RuntimeEvent[];
}

export interface IMetricEngine {
  calculateSuccessRate(events: RuntimeEvent[]): MetricRecord;
  calculateAverageExecutionTime(events: RuntimeEvent[]): MetricRecord;
  calculateVerificationRate(events: RuntimeEvent[]): MetricRecord;
}

export interface IAlertEngine {
  detectAnomalies(events: RuntimeEvent[]): AlertRecord[];
  updateAlertStatus(
    alertId: string,
    newStatus: 'REVIEW_REQUIRED' | 'RESOLVED',
    authorizedByHuman: boolean
  ): AlertRecord;
  getAlerts(): AlertRecord[];
}

export interface IDashboardDataProvider {
  getOverviewData(): DashboardOverviewData;
  getEmployeeSnapshot(employeeId: string): StateSnapshot;
}

export interface IEmployeeObservabilityEngine {
  recordEvent(event: RuntimeEvent): ObservationRecord;
  createSnapshot(employeeId: string): StateSnapshot;
  getMetrics(): MetricRecord[];
  getAlerts(): AlertRecord[];
  getDashboardOverview(): DashboardOverviewData;
  getAuditLogs(observationId?: string): ObservationRecord[];
}
