import { DevelopmentPluginMetadata } from '../../../../../sdk/core/plugin/DevelopmentPluginMetadata';
import { DevelopmentPluginId } from '../../../../../sdk/core/plugin/DevelopmentPluginId';
import { DevelopmentContextType } from '../../../../../sdk/core/context/DevelopmentContextType';
import { DevelopmentCapability } from '../../../../../sdk/core/plugin/DevelopmentCapability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

function runTests() {
  console.log('Running DevelopmentPluginMetadata tests...');

  const metadata: DevelopmentPluginMetadata = Object.freeze({
    id: DevelopmentPluginId.Performance,
    name: 'Performance Plugin',
    version: '1.0.0',
    apiVersion: '1.0',
    description: 'Plugin for evaluating performance constraints.',
    author: 'AIOS Core Team',
    priority: 10,
    supportedContexts: Object.freeze([DevelopmentContextType.RepositoryReview]),
    capabilities: Object.freeze([DevelopmentCapability.Validation, DevelopmentCapability.Governance]),
    dependencies: Object.freeze([]),
  });

  // Test 1: Basic property checks
  assert(metadata.id === DevelopmentPluginId.Performance, 'ID should be Performance');
  assert(metadata.apiVersion === '1.0', 'API Version should be 1.0');
  assert(metadata.supportedContexts.includes(DevelopmentContextType.RepositoryReview), 'Should support RepositoryReview');

  // Test 2: Immutability check
  assert(Object.isFrozen(metadata), 'Metadata should be frozen');

  // Strict mode modification test
  let threwError = false;
  try {
    'use strict';
    // @ts-ignore
    metadata.priority = 100;
  } catch (e) {
    threwError = true;
  }
  assert(threwError, 'Should throw TypeError when trying to mutate metadata.priority');

  console.log('All DevelopmentPluginMetadata tests passed!');
}

runTests();
