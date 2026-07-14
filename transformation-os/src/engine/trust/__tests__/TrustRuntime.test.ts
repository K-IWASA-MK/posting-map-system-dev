import { TrustRuntime } from '../TrustRuntime';
import { DefaultTrustScoreCalculator } from '../ScoreCalculator';
import { ProductionTrustPolicy, StrictTrustPolicy } from '../PolicyEvaluator';
import { TrustRequest, TrustLevel } from '../models';
import { MockChecksumProvider, MockSignatureProvider, MockCertificateProvider, MockSBOMProvider } from '../EvidenceProviders';

describe('Trust Runtime Foundation (Sprint X-28)', () => {
  const dummyRequest: TrustRequest = {
    pluginId: 'com.example.trust',
    version: '1.0.0',
    archiveData: new Uint8Array([1, 2, 3]),
    checksumRef: 'sha256:abc',
    signatureRef: 'sig:123'
  };

  const calculator = new DefaultTrustScoreCalculator();
  const productionPolicy = new ProductionTrustPolicy();

  it('Trust-001: Checksum - Correct checksum yields evidence, mismatch drops trust', async () => {
    let runtime = new TrustRuntime([new MockChecksumProvider(true)], calculator, productionPolicy);
    let result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.checksumMatches).toBe(true);
    expect(result.score).toBe(30);

    runtime = new TrustRuntime([new MockChecksumProvider(false)], calculator, productionPolicy);
    result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.checksumMatches).toBe(false);
    expect(result.level).toBe(TrustLevel.UNTRUSTED);
  });

  it('Trust-002: Signature - Valid signature yields evidence, invalid drops trust', async () => {
    let runtime = new TrustRuntime([new MockSignatureProvider(true)], calculator, productionPolicy);
    let result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.signatureValid).toBe(true);
    expect(result.score).toBe(40);

    runtime = new TrustRuntime([new MockSignatureProvider(false)], calculator, productionPolicy);
    result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.signatureValid).toBe(false);
    expect(result.level).toBe(TrustLevel.UNTRUSTED);
  });

  it('Trust-003: Certificate - Valid cert yields evidence', async () => {
    const runtime = new TrustRuntime([new MockCertificateProvider(true, true, true)], calculator, productionPolicy);
    const result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.certificateValid).toBe(true);
    expect(result.score).toBe(30);
  });

  it('Trust-004: Expiration - Expired cert drops trust level and score', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, false, true) // Expired (notExpired = false)
    ], calculator, productionPolicy);
    
    const result = await runtime.evaluate(dummyRequest);
    expect(result.score).toBe(70);
    expect(result.level).toBe(TrustLevel.TRUSTED); // Production treats 70 as TRUSTED
  });

  it('Trust-005: Revocation - Revoked cert results in UNTRUSTED', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, true, false) // Revoked (notRevoked = false)
    ], calculator, productionPolicy);
    
    const result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.certificateNotRevoked).toBe(false);
    expect(result.level).toBe(TrustLevel.UNTRUSTED); // Hard fail triggers UNTRUSTED
  });

  it('Trust-006: TrustLevel - Mapping from Score to Level', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, true, true)
    ], calculator, productionPolicy);
    
    const result = await runtime.evaluate(dummyRequest);
    expect(result.score).toBe(100);
    expect(result.level).toBe(TrustLevel.CERTIFIED);
  });

  it('Trust-007: Failure Isolation - Network Error != Untrusted', async () => {
    // Null triggers throw Error("Network Error") in mock provider
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(null, true, true)
    ], calculator, productionPolicy);
    
    const result = await runtime.evaluate(dummyRequest);
    // Provider fails, but runtime handles it gracefully. 
    // Cert evidence is undefined.
    expect(result.evidence.certificateValid).toBeUndefined();
    expect(result.score).toBe(70); 
    // 70 is TRUSTED. If we used StrictPolicy, it would be UNTRUSTED because it's < 100.
    // However, the test proves it didn't throw and didn't hard-fail to UNTRUSTED explicitly due to the network error, 
    // it just calculated based on available evidence.
    
    // Test with StrictPolicy
    const strictRuntime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(null), // Timeout fetching signature
      new MockCertificateProvider(null, true, true) // Timeout fetching cert
    ], calculator, new StrictTrustPolicy());
    
    const strictResult = await strictRuntime.evaluate(dummyRequest);
    expect(strictResult.score).toBe(30);
    // Strict policy with score 30 is UNTRUSTED (since >0 but <100)
    expect(strictResult.level).toBe(TrustLevel.UNTRUSTED);
  });

  it('Trust-008: Determinism - Multiple runs yield same result', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, true, true)
    ], calculator, productionPolicy);
    
    const result1 = await runtime.evaluate(dummyRequest);
    const result2 = await runtime.evaluate(dummyRequest);
    
    expect(result1.score).toBe(result2.score);
    expect(result1.level).toBe(result2.level);
  });

  it('Trust-009: Identical Input -> 100% Identical Result', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, true, true)
    ], calculator, productionPolicy);
    
    const result1 = await runtime.evaluate(dummyRequest);
    const result2 = await runtime.evaluate(dummyRequest);
    
    expect(JSON.stringify(result1.evidence)).toBe(JSON.stringify(result2.evidence));
    expect(result1.score).toBe(result2.score);
    expect(result1.level).toBe(result2.level);
  });

  it('Trust-010: DI Proof - Runtime has no dependency on Verifier', async () => {
    // We pass completely custom mock providers without modifying the runtime
    class CustomProvider {
      async provide(req: TrustRequest, ev: any) { return ev.with('customSignal', true); }
    }
    const runtime = new TrustRuntime([new CustomProvider()], calculator, productionPolicy);
    const result = await runtime.evaluate(dummyRequest);
    
    expect(result.evidence.get('customSignal')).toBe(true);
    // Runtime didn't care what the provider was
  });

  it('Trust-011: Policy change impacts Level, not Score', async () => {
    const providers = [
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockCertificateProvider(true, false, true) // Expired (Score 70)
    ];

    const prodRuntime = new TrustRuntime(providers, calculator, new ProductionTrustPolicy());
    const strictRuntime = new TrustRuntime(providers, calculator, new StrictTrustPolicy());

    const prodResult = await prodRuntime.evaluate(dummyRequest);
    const strictResult = await strictRuntime.evaluate(dummyRequest);

    // Score is identical
    expect(prodResult.score).toBe(70);
    expect(strictResult.score).toBe(70);

    // Level differs based on policy
    expect(prodResult.level).toBe(TrustLevel.TRUSTED);
    expect(strictResult.level).toBe(TrustLevel.UNTRUSTED);
  });

  it('Trust-012: Open-Closed Principle (Evidence Addition)', async () => {
    const runtime = new TrustRuntime([
      new MockChecksumProvider(true),
      new MockSignatureProvider(true),
      new MockSBOMProvider() // New Evidence Provider added without changing Runtime or Calculator
    ], calculator, productionPolicy);
    
    const result = await runtime.evaluate(dummyRequest);
    expect(result.evidence.get('hasSBOM')).toBe(true);
    expect(result.evidence.get('vulnerabilities')).toBe(0);
    // Successfully ingested new evidence types dynamically
  });
});
