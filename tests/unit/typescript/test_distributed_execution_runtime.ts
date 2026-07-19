import { DistributedExecutionRuntime } from '../../../sdk/core/distributed/DistributedExecutionRuntime';
import { ExecutionToken, RemoteAttestation, AttestationState, DistributedFailurePolicy, ExecutionResultProof } from '../../../sdk/core/distributed/ExecutionToken';
import { NodeHealthEvaluator } from '../../../sdk/core/distributed/scheduling/NodeHealthEvaluator';
import { FederatedScheduler, SchedulingStrategyType } from '../../../sdk/core/distributed/scheduling/FederatedScheduler';
import { FederationRuntime } from '../../../sdk/core/federation/FederationRuntime';
import { ContainerRuntime } from '../../../sdk/core/container/ContainerRuntime';
import { SandboxEngine } from '../../../sdk/core/sandbox/SandboxEngine';
import { OrchestrationRuntime } from '../../../sdk/core/orchestration/OrchestrationRuntime';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeService } from '../../../sdk/core/runtime/service/RuntimeService';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function runTests() {
  console.log('   Testing Distributed Execution & Federated Orchestration Runtime...\n');

  const eventBus = new AIOSEventBus();
  const federationRuntime = new FederationRuntime(eventBus);
  const sandboxEngine = new SandboxEngine(eventBus);
  const containerRuntime = new ContainerRuntime(eventBus, sandboxEngine);
  const distributedRuntime = new DistributedExecutionRuntime(eventBus, federationRuntime, containerRuntime);

  const eventLog: string[] = [];
  eventBus.subscribe('*', async (event) => {
    eventLog.push(event.eventType);
  });

  const nodeProfile1 = {
    nodeId: 'node-A',
    cpu: 8,
    memory: 16384,
    gpu: 1,
    runtimeClasses: ['CONTAINER', 'WASM'],
    runtimeCapabilities: ['NET_CONNECT', 'FS_WRITE'],
    supportedPolicies: ['strict'],
    trustScore: 85
  };

  const nodeProfile2 = {
    nodeId: 'node-B',
    cpu: 16,
    memory: 32768,
    gpu: 2,
    runtimeClasses: ['CONTAINER'],
    runtimeCapabilities: ['NET_CONNECT'],
    supportedPolicies: ['relaxed'],
    trustScore: 60 // Low trust score candidate
  };

  // ==========================================
  // 1. Node Selection & Health Evaluation
  // ==========================================
  console.log('   Testing Node Selection and health calculation...');
  const nodeSelector = distributedRuntime.getNodeSelector();
  nodeSelector.registerNode(nodeProfile1);
  nodeSelector.registerNode(nodeProfile2);

  // Health evaluation check
  const healthEvaluator = new NodeHealthEvaluator();
  const health = healthEvaluator.evaluate({ cpuUsage: 90, memoryUsage: 40, gpuUsage: 20 }, 100);
  assert(health === 80, 'Health deduction should equal 20 (high cpuUsage)');

  // Optimal node selection check
  const bestNode = nodeSelector.selectBestNode('NET_CONNECT', 80, 'CONTAINER');
  assert(bestNode.nodeId === 'node-A', 'Optimal node selection must match node-A');
  console.log('   ✓ Node Selection and Health Calculation PASSED');

  // ==========================================
  // 2. Federated Scheduling (BINPACK & ROUND-ROBIN)
  // ==========================================
  console.log('   Testing Federated Scheduling strategies...');
  const scheduler = new FederatedScheduler();
  
  // ROUND_ROBIN Strategy
  const selectedNodeRR = scheduler.schedule([nodeProfile1, nodeProfile2], SchedulingStrategyType.ROUND_ROBIN);
  assert(selectedNodeRR.nodeId === 'node-A', 'Round robin scheduling index 0 matches node-A');

  const selectedNodeRR2 = scheduler.schedule([nodeProfile1, nodeProfile2], SchedulingStrategyType.ROUND_ROBIN);
  assert(selectedNodeRR2.nodeId === 'node-B', 'Round robin scheduling index 1 matches node-B');

  // BINPACK Strategy (least loaded)
  scheduler.getLoadBalancer().incrementLoad('node-A'); // node-A has load 2, node-B has load 1
  const selectedNodeBP = scheduler.schedule([nodeProfile1, nodeProfile2], SchedulingStrategyType.BINPACK);
  assert(selectedNodeBP.nodeId === 'node-B', 'BINPACK schedules to node-B because load is lower');

  console.log('   ✓ Federated Scheduling PASSED');

  // ==========================================
  // 3. Execution Token Issuance, Attestation and Verification
  // ==========================================
  console.log('   Testing Execution Token and Remote Attestation verification...');
  const delegator = distributedRuntime.getDelegator();
  const receiver = distributedRuntime.getReceiver();

  const validAttestation: RemoteAttestation = {
    nodeId: 'node-A',
    trustScore: 85,
    certificateId: 'CERT-A',
    runtimeIntegrity: true,
    containerIntegrity: true,
    verifiedAt: new Date().toISOString(),
    state: AttestationState.VERIFIED
  };

  // Issuance happy path
  const token = await delegator.delegate(
    'EXEC-001',
    'SES-001',
    'node-A',
    'WF-001',
    'APP-001',
    validAttestation
  );
  assert(token.issuerNode === 'aios.master.node', 'Issuer node matches Master Node ID');

  // Replay Attack Detection verification
  await receiver.receive(token, validAttestation);
  try {
    await receiver.receive(token, validAttestation); // Replay nonce
    assert(false, 'Should throw error for replay attack');
  } catch (err: any) {
    assert(err.message.includes('Replay Attack Detected'), 'Replay attack message verified');
  }

  // Expiration check block
  const expiredToken: ExecutionToken = {
    ...token,
    nonce: 'expired-nonce-unique',
    expiresAt: Date.now() - 1000 // force expired
  };
  try {
    await receiver.receive(expiredToken, validAttestation);
    assert(false, 'Should throw error for expired token');
  } catch (err: any) {
    assert(err.message.includes('Token Expired'), 'Expired token verification blocker');
  }

  // Low trust score block
  const lowTrustAttestation: RemoteAttestation = {
    ...validAttestation,
    trustScore: 50 // below threshold 70
  };
  const token2 = await delegator.delegate(
    'EXEC-002',
    'SES-002',
    'node-A',
    'WF-001',
    'APP-001',
    validAttestation
  );
  try {
    await receiver.receive(token2, lowTrustAttestation);
    assert(false, 'Should block low trust delegation');
  } catch (err: any) {
    assert(err.message.includes('Trust Score Insufficient'), 'Trust score checker validation');
  }

  // Remote Attestation integrity failure block
  const invalidAttestation: RemoteAttestation = {
    ...validAttestation,
    runtimeIntegrity: false // compromise
  };
  try {
    await delegator.delegate(
      'EXEC-003',
      'SES-003',
      'node-A',
      'WF-001',
      'APP-001',
      invalidAttestation
    );
    assert(false, 'Should reject delegate request for compromised attestation');
  } catch (err: any) {
    assert(err.message.includes('Remote Attestation verification failed'), 'Attestation validator verified');
  }

  console.log('   ✓ Remote Attestation and Token verification PASSED');

  // ==========================================
  // 4. Ledger replication
  // ==========================================
  console.log('   Testing Distributed Ledger registration and result proof...');
  const registry = distributedRuntime.getRegistry();

  const mockRecord = {
    executionId: 'EXEC-001',
    sourceNode: 'aios.master.node',
    targetNode: 'node-A',
    status: 'RUNNING',
    startedAt: new Date().toISOString(),
    completedAt: '',
    attestation: validAttestation
  };
  registry.register(mockRecord);

  const proof: ExecutionResultProof = {
    executionId: 'EXEC-001',
    nodeId: 'node-A',
    resultHash: 'sha256:7f9a888c3f7b9...',
    completedAt: new Date().toISOString(),
    signature: 'SIG-PROOF-001',
    attestationId: 'ATT-VER-001'
  };
  registry.registerProof(proof);

  const finalRecord = registry.getRecord('EXEC-001');
  assert(finalRecord?.status === 'COMPLETED', 'Execution state synced to completed');
  assert(finalRecord?.proof?.resultHash === 'sha256:7f9a888c3f7b9...', 'Proof result hash matched');

  console.log('   ✓ Distributed Ledger Registration PASSED');

  // ==========================================
  // 5. Distributed Failure Policy (Failover)
  // ==========================================
  console.log('   Testing Distributed Failure Policy...');
  const supervisor = distributedRuntime.getSupervisor();
  
  const result = await supervisor.handleNodeFailure('EXEC-001', DistributedFailurePolicy.FAILOVER, 'Connection timeout');
  assert(result.actionTriggered === 'FAILOVER', 'Failover action triggered correctly');
  assert(eventLog.includes('ExecutionNodeFailureDetected'), 'Failure event published successfully');

  console.log('   ✓ Failure policy execution PASSED');

  // ==========================================
  // 6. Discovery & Orchestration Integration
  // ==========================================
  console.log('   Testing Integration with Orchestration Runtime...');
  const service = new RuntimeService(eventBus);
  await service.register(distributedRuntime, 'distributed');

  const resolved = service.resolve('aios.distributed') as DistributedExecutionRuntime;
  assert(resolved.descriptor.capabilities.includes(RuntimeCapability.DISTRIBUTED_EXECUTION as any), 'Discovery capabilities match');

  const orchRuntime = new OrchestrationRuntime(eventBus);
  orchRuntime.setDistributedRuntime(distributedRuntime);

  const queueItem = await orchRuntime.enqueueExecution('WF-DIST', 'APP-DIST', 'HIGH');
  queueItem.requestedResources.placement = 'node-A'; // target remote node

  await orchRuntime.dispatchExecution(queueItem.queueId);
  
  assert(eventLog.includes('ExecutionRequested'), 'Orchestration automatically triggered delegator request');

  console.log('   ✓ Integration and Discovery PASSED');

  console.log('\n==========================================');
  console.log('🎉 ALL DISTRIBUTED EXECUTION TESTS PASSED');
  console.log('==========================================\n');
}

runTests().catch((err) => {
  console.error('❌ Tests failed with error:', err);
  process.exit(1);
});
