import { ProtocolRegistry } from '../../../aios/kernel/ProtocolRegistry';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testGetMetadata() {
  console.log('[Test] ProtocolRegistry.get metadata lookup starting...');

  const decisionMeta = ProtocolRegistry.get('aios-decision-v1');
  assert(decisionMeta !== undefined, 'aios-decision-v1 must be registered');
  assert(decisionMeta!.protocolId === 'aios-decision-v1', 'ID mismatch');
  assert(decisionMeta!.version === '1.0.0', 'version mismatch');
  assert(decisionMeta!.compatibleVersions.includes('^1.0.0'), 'compatibility mismatch');
  assert(decisionMeta!.schemaPath.endsWith('decision-v1.json'), 'schema filename mapping mismatch');

  const unknownMeta = ProtocolRegistry.get('non-existent');
  assert(unknownMeta === undefined, 'Lookup for unregistered ID must return undefined');

  console.log('   ✓ ProtocolRegistry.get metadata lookup: PASSED');
}

async function testListMetadata() {
  console.log('[Test] ProtocolRegistry.list registered listing starting...');

  const list = ProtocolRegistry.list();
  assert(list.length === 5, `Expected 5 registered protocols, got: ${list.length}`);
  
  const ids = list.map(meta => meta.protocolId);
  assert(ids.includes('aios-decision-v1'), 'Must list decision-v1');
  assert(ids.includes('aios-consensus-v1'), 'Must list consensus-v1');
  assert(ids.includes('aios-capability-v1'), 'Must list capability-v1');
  assert(ids.includes('aios-ledger-v1'), 'Must list ledger-v1');
  assert(ids.includes('aios-governance-v1'), 'Must list governance-v1');

  console.log('   ✓ ProtocolRegistry.list registered listing: PASSED');
}

async function runAll() {
  console.log('--- Starting G7-2: ProtocolRegistry Unit Tests ---');
  await testGetMetadata();
  await testListMetadata();
  console.log('--- All G7-2: ProtocolRegistry Unit Tests PASSED ---');
}

runAll().catch((err) => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
