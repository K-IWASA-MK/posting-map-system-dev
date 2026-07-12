import { EventEnvelope } from '../eventbus/EventEnvelope';
import { TelemetryRecord } from './TelemetryRecord';
import { MetricCategory } from './MetricCategory';
import { MetricUnit } from './MetricUnit';
import { MetricName } from './MetricName';
import { EventType } from '../eventbus/EventType';

export class TelemetryMapper {
  public map(envelope: EventEnvelope): TelemetryRecord[] {
    const records: TelemetryRecord[] = [];
    const timestamp = new Date().toISOString();

    switch (envelope.eventType) {
      case EventType.ExecutionCompleted: {
        const payload = envelope.payload as any;
        const duration = typeof payload.durationMs === 'number' ? payload.durationMs : 0;
        
        // Record 1: Duration
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-1`,
          executionId: envelope.executionId,
          correlationId: envelope.correlationId,
          metricCategory: MetricCategory.EXECUTION,
          metricName: MetricName.EXECUTION_DURATION,
          value: duration,
          unit: MetricUnit.MS,
          timestamp,
          source: envelope.source,
          sourceType: 'Execution',
          schemaVersion: '1.0.0'
        }));

        // Record 2: Dummy Cost simulation to demonstrate "1 Event -> Multiple TelemetryRecords"
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-2`,
          executionId: envelope.executionId,
          correlationId: envelope.correlationId,
          metricCategory: MetricCategory.BUSINESS,
          metricName: MetricName.EXECUTION_COST,
          value: 0.05, // simulated USD
          unit: MetricUnit.USD,
          timestamp,
          source: envelope.source,
          sourceType: 'Execution',
          schemaVersion: '1.0.0'
        }));
        break;
      }

      case EventType.ReviewCompleted: {
        const payload = envelope.payload as any;
        const confidence = typeof payload.confidence === 'number' ? payload.confidence : 0;

        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-3`,
          executionId: envelope.executionId,
          correlationId: envelope.correlationId,
          metricCategory: MetricCategory.QUALITY,
          metricName: MetricName.REVIEWER_CONFIDENCE,
          value: confidence,
          unit: MetricUnit.PERCENT,
          timestamp,
          source: envelope.source,
          sourceType: 'Reviewer',
          schemaVersion: '1.0.0'
        }));
        break;
      }

      case EventType.PluginCompleted: {
        records.push(Object.freeze({
          recordId: `TEL-${Date.now()}-4`,
          executionId: envelope.executionId,
          correlationId: envelope.correlationId,
          metricCategory: MetricCategory.EXECUTION,
          metricName: MetricName.PLUGIN_COUNT,
          value: 1, // 1 plugin executed
          unit: MetricUnit.COUNT,
          timestamp,
          source: envelope.source,
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
