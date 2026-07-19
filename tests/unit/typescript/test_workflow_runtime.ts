import { WorkflowRuntime } from '../../../sdk/core/workflow/WorkflowRuntime';
import { ApplicationRuntime } from '../../../sdk/core/application/ApplicationRuntime';
import { ServiceRegistry } from '../../../sdk/core/service/ServiceRegistry';
import { SecurityRuntime } from '../../../sdk/core/security/SecurityRuntime';
import { SecurityContext } from '../../../sdk/core/security/SecurityModels';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { WorkflowDefinition, WorkflowNode, WorkflowEdge, WorkflowCheckpoint } from '../../../sdk/core/workflow/WorkflowModels';
import { ApplicationDefinition, ApplicationProfile, ApplicationSignature } from '../../../sdk/core/application/ApplicationModels';
import { ApplicationManifest } from '../../../sdk/core/application/ApplicationManifest';
import { ServiceDefinition, ServiceIdentity } from '../../../sdk/core/service/ServiceModels';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testWorkflowDAGValidation() {
  console.log('[Test 1] Workflow DAG loop and isolated node validation starting...');
  const eventBus = new AIOSEventBus();
  const wfRuntime = new WorkflowRuntime(eventBus);

  const nodeA: WorkflowNode = { nodeId: 'node-A', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };
  const nodeB: WorkflowNode = { nodeId: 'node-B', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };
  const nodeC: WorkflowNode = { nodeId: 'node-C', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };

  // 1. Loop detection (Cycle graph)
  const cycleWorkflow: WorkflowDefinition = {
    workflowId: 'cycle-wf',
    version: '1.0.0',
    nodes: [nodeA, nodeB, nodeC],
    edges: [
      { from: 'node-A', to: 'node-B' },
      { from: 'node-B', to: 'node-C' },
      { from: 'node-C', to: 'node-A' }
    ],
    entryNode: 'node-A',
    exitNode: 'node-C',
    status: 'ACTIVE'
  };

  try {
    await wfRuntime.registerWorkflow(cycleWorkflow);
    assert(false, 'Should throw error when cycle is detected');
  } catch (e: any) {
    assert(e.message.includes('Graph cycle detected'), 'Expected cycle exception');
  }

  // 2. Isolated node checking
  const isolatedWorkflow: WorkflowDefinition = {
    workflowId: 'isolated-wf',
    version: '1.0.0',
    nodes: [nodeA, nodeB, nodeC],
    edges: [
      { from: 'node-A', to: 'node-B' }
    ],
    entryNode: 'node-A',
    exitNode: 'node-B',
    status: 'ACTIVE'
  };

  try {
    await wfRuntime.registerWorkflow(isolatedWorkflow);
    assert(false, 'Should throw error when isolated node is detected');
  } catch (e: any) {
    assert(e.message.includes('Isolated node detected'), 'Expected isolated node exception');
  }

  // 3. Normal DAG verification
  const validWorkflow: WorkflowDefinition = {
    workflowId: 'valid-wf',
    version: '1.0.0',
    nodes: [nodeA, nodeB, nodeC],
    edges: [
      { from: 'node-A', to: 'node-B' },
      { from: 'node-B', to: 'node-C' }
    ],
    entryNode: 'node-A',
    exitNode: 'node-C',
    status: 'ACTIVE'
  };

  await wfRuntime.registerWorkflow(validWorkflow);
  const reg = wfRuntime.getRegistry().getWorkflow('valid-wf');
  assert(reg !== undefined, 'Valid workflow should be successfully registered');

  console.log('[Test 1] Workflow DAG loop and isolated node validation: PASSED');
}

async function testApplicationProvisioningAndRollback() {
  console.log('[Test 2] Application Provisioning and Rollback starting...');
  const eventBus = new AIOSEventBus();
  const appRuntime = new ApplicationRuntime(eventBus);
  const srvRegistry = new ServiceRegistry();

  const app: ApplicationDefinition = {
    applicationId: 'app-01',
    name: 'National App',
    version: '1.0.0',
    workflows: ['valid-wf'],
    services: ['missing-service'], // dependency service
    configuration: {},
    status: 'INACTIVE'
  };

  const signature: ApplicationSignature = {
    applicationId: 'app-01',
    manifestHash: 'HASH-APP',
    signature: 'SIG-APP-OK',
    certificateId: 'CERT-APP'
  };

  const profile: ApplicationProfile = {
    profileId: 'PROF-PROD',
    environment: 'PRODUCTION',
    configuration: {},
    requiredCapabilities: ['SERVICE']
  };

  const manifest: any = {
    manifestVersion: '1.0',
    runtimeId: 'aios.application',
    runtimeName: 'Application Runtime',
    runtimeVersion: '1.0.0',
    contractVersion: '1.0',
    capabilities: [RuntimeCapability.APPLICATION],
    dependencies: [],
    signature,
    profile,
    workflows: ['valid-wf'],
    services: ['missing-service'],
    configuration: { maxConcurrency: 10 },
    lifecyclePolicy: { cooldownPeriodMs: 0 }
  };

  await appRuntime.registerApplication(app, manifest);

  // 1. Provisioning validate should fail due to missing dependency service
  try {
    await appRuntime.deployApplication('app-01', srvRegistry, ['SERVICE']);
    assert(false, 'Should fail provisioning validation when dependency service is missing');
  } catch (e: any) {
    assert(e.message.includes('Provisioning validation failed'), 'Expected missing service exception');
  }

  // 2. Meet dependencies and check active state progression
  const service: ServiceDefinition = {
    serviceId: 'missing-service',
    providerId: 'provider-01',
    version: '1.0.0',
    capabilities: ['LOGGING'],
    licenseType: 'FREE',
    billingModel: 'FREE',
    status: 'ACTIVE'
  };
  const identity: ServiceIdentity = {
    serviceId: 'missing-service',
    publisherId: 'provider-01',
    manifestHash: 'HASH-DEF',
    signature: 'SIG-OK',
    certificateId: 'CERT-1',
    trustScore: 90,
    status: 'ACTIVE'
  };
  srvRegistry.registerService(service, identity);

  const plan = await appRuntime.deployApplication('app-01', srvRegistry, ['SERVICE']);
  assert(plan.status === 'COMPLETED', 'Provisioning plan should be COMPLETED');

  const activeApp = appRuntime.getRegistry().getApplication('app-01');
  assert(activeApp!.status === 'ACTIVE', 'Application status should be ACTIVE after successful deploy');

  console.log('[Test 2] Application Provisioning and Rollback: PASSED');
}

async function testWorkflowCheckpointAndResume() {
  console.log('[Test 3] Workflow Checkpoint and Resume starting...');
  const eventBus = new AIOSEventBus();
  const wfRuntime = new WorkflowRuntime(eventBus);

  const nodeA: WorkflowNode = { nodeId: 'node-A', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };
  const nodeB: WorkflowNode = { nodeId: 'node-B', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };
  const nodeC: WorkflowNode = { nodeId: 'node-C', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };

  const workflow: WorkflowDefinition = {
    workflowId: 'run-wf',
    version: '1.0.0',
    nodes: [nodeA, nodeB, nodeC],
    edges: [
      { from: 'node-A', to: 'node-B' },
      { from: 'node-B', to: 'node-C' }
    ],
    entryNode: 'node-A',
    exitNode: 'node-C',
    status: 'ACTIVE'
  };

  await wfRuntime.registerWorkflow(workflow);

  // 1. Initial complete run
  const result1 = await wfRuntime.startWorkflow('run-wf');
  assert(result1.join(',') === 'node-A,node-B,node-C', 'Expected order node-A -> node-B -> node-C');

  // Verify checkpoints were registered
  const cps = wfRuntime.getExecutor().getCheckpoints('run-wf');
  assert(cps.length === 3, 'Expected 3 checkpoints, found ' + cps.length);

  // 2. Resume execution from node-B checkpoint
  // We'll pass the checkpointId of node-B
  const checkpointB = cps.find(c => c.nodeId === 'node-B');
  const result2 = await wfRuntime.startWorkflow('run-wf', checkpointB!.checkpointId);
  
  // The executor skips completed node-A, and restarts execution from node-B onwards
  assert(result2.join(',') === 'node-A,node-B,node-C', 'Verify sequence completion returned');
  assert(wfRuntime.getExecutor().getNodeStatus('node-A') === 'COMPLETED', 'node-A should be skipped and marked COMPLETED');

  console.log('[Test 3] Workflow Checkpoint and Resume: PASSED');
}

async function testWorkflowSecurityApproval() {
  console.log('[Test 4] Security Runtime Workflow checks starting...');
  const eventBus = new AIOSEventBus();
  const wfRuntime = new WorkflowRuntime(eventBus);
  const securityRuntime = new SecurityRuntime(eventBus);

  await securityRuntime.start();
  securityRuntime.setWorkflowRuntime(wfRuntime);

  const nodeA: WorkflowNode = { nodeId: 'node-A', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };
  const nodeB: WorkflowNode = { nodeId: 'node-B', type: 'service', action: 'run', config: {}, requiredCapabilities: [] };

  const workflow: WorkflowDefinition = {
    workflowId: 'secured-wf',
    version: '1.0.0',
    nodes: [nodeA, nodeB],
    edges: [{ from: 'node-A', to: 'node-B' }],
    entryNode: 'node-A',
    exitNode: 'node-B',
    approvalPolicy: 'STRICT-APPROVAL',
    status: 'ACTIVE'
  };

  await wfRuntime.registerWorkflow(workflow);

  // 1. Request execution with LOW trust level principal: should be DENIED
  const secCtx1: SecurityContext = {
    contextId: 'CTX-TEST-W1',
    runtimeId: 'core.runtime',
    principalId: 'operator-low',
    sessionId: 'sess-wf-sec1',
    trustLevel: 'LOW',
    capabilities: ['*']
  };

  const auth1 = await securityRuntime.authorize(secCtx1, 'workflow:secured-wf', 'execute');
  assert(auth1.result === 'DENY', 'Low trust level principal should be blocked from STRICT-APPROVAL workflows');
  assert(auth1.reason.includes('requires STRICT-APPROVAL'), 'Expected strict approval block reason');

  // 2. Request execution with HIGH trust level principal: should be ALLOWED
  const secCtx2: SecurityContext = {
    contextId: 'CTX-TEST-W2',
    runtimeId: 'core.runtime',
    principalId: 'operator-high',
    sessionId: 'sess-wf-sec2',
    trustLevel: 'HIGH',
    capabilities: ['*']
  };

  const auth2 = await securityRuntime.authorize(secCtx2, 'workflow:secured-wf', 'execute');
  assert(auth2.result === 'ALLOW', 'High trust level principal should be allowed execution');

  console.log('[Test 4] Security Runtime Workflow checks: PASSED');
}

async function testDiscoveryCapabilities() {
  console.log('[Test 5] Application Capabilities starting...');
  const eventBus = new AIOSEventBus();
  const appRuntime = new ApplicationRuntime(eventBus);
  const wfRuntime = new WorkflowRuntime(eventBus);

  assert(appRuntime.descriptor.capabilities.includes(RuntimeCapability.APPLICATION), 'APPLICATION capability missing');
  assert(appRuntime.descriptor.capabilities.includes(RuntimeCapability.PROVISIONING), 'PROVISIONING capability missing');
  assert(wfRuntime.descriptor.capabilities.includes(RuntimeCapability.WORKFLOW), 'WORKFLOW capability missing');
  console.log('[Test 5] Application Capabilities: PASSED');
}

async function runAll() {
  console.log('--- Starting Workflow & Application Runtime Tests ---');
  await testWorkflowDAGValidation();
  await testApplicationProvisioningAndRollback();
  await testWorkflowCheckpointAndResume();
  await testWorkflowSecurityApproval();
  await testDiscoveryCapabilities();
  console.log('--- All Workflow & Application Runtime Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
