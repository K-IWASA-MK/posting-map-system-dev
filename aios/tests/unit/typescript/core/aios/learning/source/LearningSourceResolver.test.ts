import { LearningSourceResolver } from '../../../../../../../sdk/core/aios/learning/source/LearningSourceResolver';
import { LearningSourceRegistry } from '../../../../../../../sdk/core/aios/learning/source/LearningSourceRegistry';
import { SourceType } from '../../../../../../../sdk/core/aios/learning/source/SourceType';
import { LearningRequest } from '../../../../../../../sdk/core/aios/learning/source/LearningRequest';
import { ILearningSource } from '../../../../../../../sdk/core/aios/learning/source/ILearningSource';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

class MockSource implements ILearningSource {
  private type: SourceType;
  private hasTimeRange: boolean;

  constructor(type: SourceType, hasTimeRange: boolean) {
    this.type = type;
    this.hasTimeRange = hasTimeRange;
  }

  supports(r: LearningRequest) { return r.sourceType === this.type; }
  async load(r: LearningRequest): Promise<any> { return {}; }
  capability() {
    return {
      supportsExecutionFilter: true,
      supportsTimeRange: this.hasTimeRange,
      supportsCorrelationId: true
    };
  }
  priority() { return 100; }
}

function runTests() {
  console.log('Running LearningSourceResolver tests...');

  const registry = new LearningSourceRegistry();
  const resolver = new LearningSourceResolver(registry);

  // Register source without timeRange support
  registry.register(new MockSource(SourceType.TELEMETRY, false));

  // Test 1: Successful resolution
  const reqValid: LearningRequest = {
    requestId: 'REQ-1',
    sourceType: SourceType.TELEMETRY,
    executionId: 'EX-1',
    filters: {},
    schemaVersion: '1.0.0'
  };

  const res = resolver.resolve(reqValid);
  assert(res.source !== undefined, 'Should resolve source successfully');

  // Test 2: Capability Mismatch (Capability Test)
  const reqTimeRange: LearningRequest = {
    requestId: 'REQ-2',
    sourceType: SourceType.TELEMETRY,
    timeRange: { start: '2026-07-12T12:00:00.000Z', end: '2026-07-12T12:05:00.000Z' },
    filters: {},
    schemaVersion: '1.0.0'
  };

  let threwCapabilityError = false;
  try {
    resolver.resolve(reqTimeRange);
  } catch (e: any) {
    threwCapabilityError = true;
    assert(e.message.includes('Capability Mismatch Error'), 'Should report capability mismatch');
  }
  assert(threwCapabilityError, 'Resolver should block resolution if capabilities are missing');

  console.log('All LearningSourceResolver tests passed!');
}

runTests();
