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
  },
  {
    id: 'task-gateway-foundation',
    version: 1,
    name: 'Task Gateway Foundation Unit Tests',
    module: 'tests/unit/typescript/test_task_gateway_foundation.ts',
    category: 'foundation',
    tags: ['gateway', 'task-contract', 'first-principle', 'workflow-profile'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'task-dispatcher-foundation',
    version: 1,
    name: 'Task Dispatcher Foundation Unit Tests',
    module: 'tests/unit/typescript/test_task_dispatcher_foundation.ts',
    category: 'foundation',
    tags: ['dispatcher', 'assignment-contract', 'capability-match', 'role-resolver'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'task-lifecycle-foundation',
    version: 1,
    name: 'Task Lifecycle Foundation Unit Tests',
    module: 'tests/unit/typescript/test_task_lifecycle_foundation.ts',
    category: 'foundation',
    tags: ['lifecycle', 'state-machine', 'task-state', 'outcome-separation'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'knowledge-capture-foundation',
    version: 1,
    name: 'Knowledge Capture Foundation Unit Tests',
    module: 'tests/unit/typescript/test_knowledge_capture_foundation.ts',
    category: 'foundation',
    tags: ['knowledge', 'knowledge-candidate', 'capture-policy', 'facts-inferences'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'skill-learning-foundation',
    version: 1,
    name: 'Skill Learning Foundation Unit Tests',
    module: 'tests/unit/typescript/test_skill_learning_foundation.ts',
    category: 'foundation',
    tags: ['learning', 'skill-evidence', 'skill-candidate', 'proficiency-mapper'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'task-gateway-workflow-profile',
    version: 1,
    name: 'Task Gateway Workflow Profile Unit Tests',
    module: 'tests/unit/typescript/test_task_gateway_workflow_profile.ts',
    category: 'foundation',
    tags: ['gateway', 'workflow-profile', 'completion-policy', 'stages'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  },
  {
    id: 'legacy-contract-adapter-foundation',
    version: 1,
    name: 'Legacy Contract Adapter Foundation Unit Tests',
    module: 'tests/unit/typescript/test_legacy_contract_adapter.ts',
    category: 'foundation',
    tags: ['adapter', 'legacy', 'dto', 'validation', 'gateway'],
    capabilities: [],
    timeout: 30000,
    enabled: true
  }
];
