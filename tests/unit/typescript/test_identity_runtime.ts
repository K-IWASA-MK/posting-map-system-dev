import { IdentityRuntime } from '../../../sdk/core/identity/IdentityRuntime';
import { TrustEngine } from '../../../sdk/core/identity/trust/TrustEngine';
import { SecurityRuntime } from '../../../sdk/core/security/SecurityRuntime';
import { SecurityContext } from '../../../sdk/core/security/SecurityModels';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { DigitalIdentity, TrustEvidence, TrustPolicy } from '../../../sdk/core/identity/IdentityModels';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testIdentityAndCertificateStore() {
  console.log('[Test 1] Identity & Certificate Store starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new TrustEngine(eventBus, identityRuntime);

  // 1. Register identity inside PLUGIN namespace
  const identity = await identityRuntime.registerSubject('PLUGIN', 'PLUGIN', 'logger-plugin', 'PUB-KEY-LOGGER');
  assert(identity.status === 'REGISTERED', 'Identity status should be REGISTERED on creation');
  assert(identity.namespace === 'PLUGIN', 'Namespace mismatch');

  // Verify registry contains identity
  const registered = identityRuntime.getRegistry().getIdentity(identity.identityId);
  assert(registered !== undefined, 'Registry should store the identity');

  // 2. Issue and activate certificate in store
  const store = trustEngine.getCertificateStore();
  const cert = store.issueCertificate(identity.identityId, identity.publicKey);
  assert(cert.status === 'ISSUED', 'Certificate status should be ISSUED');
  
  store.activateCertificate(cert.certificateId);
  assert(store.verifyValidity(cert.certificateId) === 'ACTIVE', 'Certificate status should be ACTIVE');

  // 3. Renew certificate
  const newCert = store.renewCertificate(cert.certificateId);
  assert(store.verifyValidity(cert.certificateId) === 'REVOKED', 'Old certificate must be REVOKED after renewal');
  assert(newCert.status === 'ISSUED', 'Renewed certificate status should be ISSUED');

  console.log('[Test 1] Identity & Certificate Store: PASSED');
}

async function testSignatureVerificationAndCRL() {
  console.log('[Test 2] Signature Verification & CRL starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new TrustEngine(eventBus, identityRuntime);

  const identity = await identityRuntime.registerSubject('AGENT', 'AGENT', 'broker-agent', 'PUB-KEY-BROKER');
  await identityRuntime.verifyIdentity(identity.identityId); // VERIFIED status

  const store = trustEngine.getCertificateStore();
  const cert = store.issueCertificate(identity.identityId, identity.publicKey);
  store.activateCertificate(cert.certificateId);

  // Update identity certificateId mapping to sync store with identity lookup
  identityRuntime.getRegistry().registerIdentity({
    ...identity,
    status: 'VERIFIED',
    certificateId: cert.certificateId
  });

  const payload = 'action:execute_task_payload';
  const verifier = trustEngine.getSignatureVerifier();
  const validSignature = verifier.computeMockSignature(payload, identity.publicKey);

  // 1. Correct signature must match verification
  const verify1 = await trustEngine.verifySignature(identity.identityId, payload, validSignature);
  assert(verify1 === true, 'Signature verification failed for valid credentials');

  // 2. Incorrect signature must fail
  const verify2 = await trustEngine.verifySignature(identity.identityId, payload, 'BAD-SIGNATURE-KEY');
  assert(verify2 === false, 'Invalid signature should not pass verification');

  // 3. CRL revocation exclusion
  store.revokeCertificate(cert.certificateId);
  const verify3 = await trustEngine.verifySignature(identity.identityId, payload, validSignature);
  assert(verify3 === false, 'Revoked certificate signatures must be blocked');

  console.log('[Test 2] Signature Verification & CRL: PASSED');
}

async function testTrustScoringAndDecay() {
  console.log('[Test 3] Trust Scoring & Decay starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new TrustEngine(eventBus, identityRuntime);

  const identity = await identityRuntime.registerSubject('APPLICATION', 'APPLICATION', 'client-app', 'PUB-KEY-APP');
  await identityRuntime.verifyIdentity(identity.identityId);

  const store = trustEngine.getCertificateStore();
  const cert = store.issueCertificate(identity.identityId, identity.publicKey);
  store.activateCertificate(cert.certificateId);

  identityRuntime.getRegistry().registerIdentity({
    ...identity,
    status: 'VERIFIED',
    certificateId: cert.certificateId
  });

  // Base evaluation without evidence should default to 100
  const record1 = await trustEngine.evaluateTrust(identity.identityId);
  assert(record1.trustScore === 100, 'Default trust score should be 100');

  // Add low-rating evidence (e.g. security violation)
  const evidence: TrustEvidence = {
    evidenceId: 'EVI-SEC-1',
    identityId: identity.identityId,
    source: 'SecurityRuntime',
    category: 'auth_fail',
    score: 40,
    weight: 0.9,
    timestamp: new Date().toISOString()
  };
  await trustEngine.addEvidence(evidence);

  // Add high-rating signature verification evidence
  const evidence2: TrustEvidence = {
    evidenceId: 'EVI-SIG-MOCK',
    identityId: identity.identityId,
    source: 'SignatureVerification',
    category: 'cryptographic_signature',
    score: 100,
    weight: 1.0,
    timestamp: new Date().toISOString()
  };
  await trustEngine.addEvidence(evidence2);

  const record2 = await trustEngine.evaluateTrust(identity.identityId);
  assert(record2.trustScore < 100, 'Score should reduce after adding bad evidence');

  // Verify policy customization
  const customPolicy: TrustPolicy = {
    policyId: 'POL-CUSTOM-WEIGHT',
    weights: {
      SecurityRuntime: 2.0, // amplify the bad evidence weight
      SignatureVerification: 0.1 // reduce the signature weight
    },
    thresholds: { minPassingScore: 70 },
    decayModel: { decayRatePerHour: 5.0 } // 5 points lost per hour elapsed
  };
  trustEngine.setPolicy(customPolicy);

  const record3 = await trustEngine.evaluateTrust(identity.identityId);
  assert(record3.trustScore < record2.trustScore, 'Score should drop further under customized weighted policy');

  console.log('[Test 3] Trust Scoring & Decay: PASSED');
}

async function testSecurityRuntimeIntegration() {
  console.log('[Test 4] Security Runtime Integration starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);
  const trustEngine = new TrustEngine(eventBus, identityRuntime);
  const securityRuntime = new SecurityRuntime(eventBus);

  await securityRuntime.start();
  securityRuntime.setTrustEngine(trustEngine);

  // Setup low trust identity (due to low rating evidence)
  const identity = await identityRuntime.registerSubject('PLUGIN', 'PLUGIN', 'untrustworthy-plugin', 'KEY-BAD-TRUST');
  await identityRuntime.verifyIdentity(identity.identityId);

  const store = trustEngine.getCertificateStore();
  const cert = store.issueCertificate(identity.identityId, identity.publicKey);
  store.activateCertificate(cert.certificateId);

  identityRuntime.getRegistry().registerIdentity({
    ...identity,
    status: 'VERIFIED',
    certificateId: cert.certificateId
  });

  // Inject negative security evidence to pull trust score below 70
  await trustEngine.addEvidence({
    evidenceId: 'EVI-SEC-FAIL',
    identityId: identity.identityId,
    source: 'SecurityRuntime',
    category: 'privilege_escalation',
    score: 20,
    weight: 1.0,
    timestamp: new Date().toISOString()
  });

  const secCtx: SecurityContext = {
    contextId: 'CTX-TEST-T',
    runtimeId: 'core.runtime',
    principalId: identity.identityId, // Set identityId as principalId
    sessionId: 'sess-trust',
    trustLevel: 'HIGH',
    capabilities: ['*']
  };

  // Authorize call should evaluate trust score and return DENY since score is < 70
  const auth = await securityRuntime.authorize(secCtx, 'ledger', 'write');
  assert(auth.result === 'DENY', 'Low trust score identity must be blocked from authorization');
  assert(auth.reason.includes('below minimum passing threshold'), 'Expected trust score block reason');

  console.log('[Test 4] Security Runtime Integration: PASSED');
}

async function testIdentityTrustCapabilities() {
  console.log('[Test 5] Identity & Trust Capabilities starting...');
  const eventBus = new AIOSEventBus();
  const identityRuntime = new IdentityRuntime(eventBus);

  assert(identityRuntime.descriptor.capabilities.includes(RuntimeCapability.IDENTITY), 'IDENTITY capability missing');
  console.log('[Test 5] Identity & Trust Capabilities: PASSED');
}

async function runAll() {
  console.log('--- Starting Identity & Trust Foundation Unit Tests ---');
  await testIdentityAndCertificateStore();
  await testSignatureVerificationAndCRL();
  await testTrustScoringAndDecay();
  await testSecurityRuntimeIntegration();
  await testIdentityTrustCapabilities();
  console.log('--- All Identity & Trust Foundation Unit Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
