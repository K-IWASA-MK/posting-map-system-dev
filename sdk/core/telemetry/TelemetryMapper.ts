import { AIOSEvent } from '../event/AIOSEvent';
import { TelemetryRecord } from './TelemetryRecord';
import { MetricCategory } from './MetricCategory';
import { MetricUnit } from './MetricUnit';
import { MetricName } from './MetricName';

export class TelemetryMapper {
  public map(event: AIOSEvent): TelemetryRecord[] {
    const records: TelemetryRecord[] = [];
    const timestamp = new Date().toISOString();
    const executionId = (event.payload as any)?.executionId || event.correlationId;

    switch (event.eventType) {
      case 'ExecutionCompleted': {
        const payload = event.payload as any;
        const duration = typeof payload.durationMs === 'number' ? payload.durationMs : 0;
        
        // Record 1: Duration
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-1`,
          executionId,
          correlationId: event.correlationId,
          metricCategory: MetricCategory.EXECUTION,
          metricName: MetricName.EXECUTION_DURATION,
          value: duration,
          unit: MetricUnit.MS,
          timestamp,
          source: event.producerRuntimeId,
          sourceType: 'Execution',
          schemaVersion: '1.0.0'
        }));

        // Record 2: Dummy Cost simulation to demonstrate "1 Event -> Multiple TelemetryRecords"
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-2`,
          executionId,
          correlationId: event.correlationId,
          metricCategory: MetricCategory.BUSINESS,
          metricName: MetricName.EXECUTION_COST,
          value: 0.05, // simulated USD
          unit: MetricUnit.USD,
          timestamp,
          source: event.producerRuntimeId,
          sourceType: 'Execution',
          schemaVersion: '1.0.0'
        }));
        break;
      }

      case 'ReviewCompleted': {
        const payload = event.payload as any;
        const confidence = typeof payload.confidence === 'number' ? payload.confidence : 0;

        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-3`,
          executionId,
          correlationId: event.correlationId,
          metricCategory: MetricCategory.QUALITY,
          metricName: MetricName.REVIEWER_CONFIDENCE,
          value: confidence,
          unit: MetricUnit.PERCENT,
          timestamp,
          source: event.producerRuntimeId,
          sourceType: 'Reviewer',
          schemaVersion: '1.0.0'
        }));
        break;
      }

      case 'PluginCompleted': {
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-4`,
          executionId,
          correlationId: event.correlationId,
          metricCategory: MetricCategory.EXECUTION,
          metricName: MetricName.PLUGIN_COUNT,
          value: 1, // 1 plugin executed
          unit: MetricUnit.COUNT,
          timestamp,
          source: event.producerRuntimeId,
          sourceType: 'Plugin',
          schemaVersion: '1.0.0'
        }));
        break;
      }

      default:
        // Rule: Unknown events are skipped, not throwing exceptions
        break;
    }

    return records;
  }
}

