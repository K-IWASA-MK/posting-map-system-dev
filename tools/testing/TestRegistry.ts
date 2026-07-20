import { TestAsset } from './TestAsset';

/**
 * Single Source of Truth for standard registered AIOS tests.
 */
export const REGISTERED_TESTS: TestAsset[] = [
  {
    id: 'service-runtime',
    version: 1,
    name: 'Service & Marketplace Runtime Tests',
    module: 'tests/unit/typescript/test_service_runtime.ts',
    category: 'runtime',
    tags: ['service', 'marketplace', 'license', 'billing'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  }
];
