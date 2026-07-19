import { FederationRuntime } from '../../../sdk/core/federation/FederationRuntime';
import { IdentityResolver } from '../../../sdk/core/federation/identity/IdentityResolver';
import { FederationTrustEngine } from '../../../sdk/core/federation/trust/FederationTrustEngine';
import { IdentityRuntime } from '../../../sdk/core/identity/IdentityRuntime';
import { SecurityRuntime } from '../../../sdk/core/security/SecurityRuntime';
import { SecurityContext } from '../../../sdk/core/security/SecurityModels';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { FederationDomainProfile, FederationSession, FederationTrustEvidence, IdentityMappingPolicy, FederationPolicyVersion } from '../../../sdk/core/federation/FederationModels';
import { RemoteIdentity } from '../../../sdk/core/federation/identity/RemoteIdentity';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testDomainRegistrationAndSession() {
  console.log('[Test 1] Domain Registration and Session starting...');
  const eventBus = new AIOSEventBus();
  const fedRuntime = new FederationRuntime(eventBus);
  
  const profile: FederationDomainProfile = {
    domainId: 'OSAKA-01',
    domainType: 'AIOS',
    protocol: 'HTTPS',
    trustLevel: 'HIGH',
    supportedCapabilities: ['IDENTITY', 'TRUST']
  };

  await fedRuntime.registerDomain(profile);
  const regProfile = fedRuntime.getRegistry().getDomainProfile('OSAKA-01');
  assert(regProfile !== undefined, 'Domain profile Osaka should be registered');

  // Establish session
  const session = await fedRuntime.establishSession('OSAKA-01');
  assert(session.status === 'ESTABLISHED', 'Session should be ESTABLISHED');

  // Terminate session
  await fedRuntime.terminateSession(session.sessionId);
  const termSession = fedRuntime.getRegistry().getSession(session.sessionId);
  assert(termSession!.status === 'TERMINATED', 'Session should transition to TERMINATED');

  console.log('[Test 1] Domain Registration and Session: PASSED');
}

async function testIdentityMapping() {
  console.log('[Test 2] Identity Mapping Policies starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);
  const resolver = new IdentityResolver(identityRuntime);

  const remoteUser: RemoteIdentity = {
    remoteId: 'remote-user-01',
    domainId: 'TOKYO-01',
    principalName: 'remote-user',
    attributes: {},
    roles: ['operator']
  };

  // Default translation mapping policy
  const mapped1 = await resolver.resolveRemoteIdentity(remoteUser);
  assert(mapped1.mappedIdentityId === 'ID-USER-TOKYO-01:remote-user-01', 'Default NamespaceTranslation mapping mismatch');

  // Configure custom policy: 1:1 mapping
  const policy: IdentityMappingPolicy = {
    policyId: 'POL-MAP-1-1',
    mappingType: '1:1',
    priority: 1,
    conditions: []
  };
  resolver.getMapper().setPolicy(policy);

  // Clear registry mapping cache to re-evaluate mapper
  resolver.getRegistry().revokeMapping('TOKYO-01', 'remote-user-01');

  // Map Osaka admin remote with custom 1:1 policy
  const remoteAdmin: RemoteIdentity = {
    remoteId: 'admin-remote',
    domainId: 'OSAKA-01',
    principalName: 'admin',
    attributes: {},
    roles: []
  };
  const mapped2 = await resolver.resolveRemoteIdentity(remoteAdmin);
  assert(mapped2.mappedIdentityId === 'ID-SYSTEM-admin-local', 'Custom 1:1 mapping mismatch');

  console.log('[Test 2] Identity Mapping Policies: PASSED');
}

async function testFederationTrustAndCaching() {
  console.log('[Test 3] Federation Trust Scoring & Cache starting...');
  const eventBus = new AIOSEventBus();
  const fedRuntime = new FederationRuntime(eventBus);
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new FederationTrustEngine(eventBus, fedRuntime, identityRuntime);

  const profile: FederationDomainProfile = {
    domainId: 'PARTNER-01',
    domainType: 'PARTNER',
    protocol: 'HTTPS',
    trustLevel: 'MEDIUM',
    supportedCapabilities: ['*']
  };

  await fedRuntime.registerDomain(profile);

  // Certificate exchange
  const certId = await trustEngine.exchangeCertificate(profile);
  assert(certId.includes('CERT-EXCH'), 'Exchanged certificate format mismatch');

  // Evaluate trust: default should be 100
  const score1 = await trustEngine.evaluateDomainTrust('PARTNER-01');
  assert(score1 === 100, 'Default domain trust score should be 100');

  // Add low-rating evidence
  const evidence: FederationTrustEvidence = {
    evidenceId: 'EVI-FED-ERR-1',
    domainId: 'PARTNER-01',
    source: 'ConnectionAudit',
    verificationType: 'latency_timeout',
    score: 30,
    timestamp: new Date().toISOString()
  };
  await trustEngine.addDomainEvidence(evidence);

  // Score should drop
  const score2 = await trustEngine.evaluateDomainTrust('PARTNER-01');
  assert(score2 < 100, 'Domain trust score should reduce after failure evidence');

  // Invalidate trust cache
  trustEngine.getRegistry().invalidateCache('PARTNER-01');
  assert(trustEngine.getRegistry().getCachedScore('PARTNER-01') === undefined, 'Trust cache invalidation failed');

  console.log('[Test 3] Federation Trust Scoring & Cache: PASSED');
}

async function testFederationSecurityIntegration() {
  console.log('[Test 4] Security Runtime Integration starting...');
  const eventBus = new AIOSEventBus();
  const fedRuntime = new FederationRuntime(eventBus);
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new FederationTrustEngine(eventBus, fedRuntime, identityRuntime);
  const securityRuntime = new SecurityRuntime(eventBus);
  const resolver = new IdentityResolver(identityRuntime);

  await securityRuntime.start();
  securityRuntime.setTrustEngine(trustEngine);

  // Register remote domain
  const profile: FederationDomainProfile = {
    domainId: 'INSECURE-01',
    domainType: 'CLOUD',
    protocol: 'HTTPS',
    trustLevel: 'LOW',
    supportedCapabilities: []
  };
  await fedRuntime.registerDomain(profile);

  // Map untrusted remote identity
  const remoteUser: RemoteIdentity = {
    remoteId: 'untrusted-user',
    domainId: 'INSECURE-01',
    principalName: 'untrusted',
    attributes: {},
    roles: []
  };
  const mapping = await resolver.resolveRemoteIdentity(remoteUser);

  // Inject negative domain evidence to pull trust score below 70
  await trustEngine.addDomainEvidence({
    evidenceId: 'EVI-BAD-FED',
    domainId: 'INSECURE-01',
    source: 'ConnectionAudit',
    verificationType: 'security_violation',
    score: 40,
    timestamp: new Date().toISOString()
  });

  const secCtx: SecurityContext = {
    contextId: 'CTX-TEST-F',
    runtimeId: 'core.runtime',
    principalId: mapping.mappedIdentityId, // e.g. ID-USER-INSECURE-01:untrusted-user
    sessionId: 'sess-fed-trust',
    trustLevel: 'HIGH',
    capabilities: ['*']
  };

  // Authorize call should verify domain trust score and return DENY since score is < 70
  const auth = await securityRuntime.authorize(secCtx, 'ledger', 'write');
  assert(auth.result === 'DENY', 'Low trust score domain identity must be blocked from authorization');
  assert(auth.reason.includes('Remote domain trust score'), 'Expected remote domain trust block reason');

  console.log('[Test 4] Security Runtime Integration: PASSED');
}

async function testFederationCapabilities() {
  console.log('[Test 5] Federation Capabilities starting...');
  const eventBus = new AIOSEventBus();
  const fedRuntime = new FederationRuntime(eventBus);

  assert(fedRuntime.descriptor.capabilities.includes(RuntimeCapability.FEDERATION), 'FEDERATION capability missing');
  console.log('[Test 5] Federation Capabilities: PASSED');
}

async function runAll() {
  console.log('--- Starting Federation Runtime & Cross-Domain Identity Tests ---');
  await testDomainRegistrationAndSession();
  await testIdentityMapping();
  await testFederationTrustAndCaching();
  await testFederationSecurityIntegration();
  await testFederationCapabilities();
  console.log('--- All Federation Runtime & Cross-Domain Identity Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
