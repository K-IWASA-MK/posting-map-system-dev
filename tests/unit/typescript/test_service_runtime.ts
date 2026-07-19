import { ServiceRuntime } from '../../../sdk/core/service/ServiceRuntime';
import { MarketplaceRuntime } from '../../../sdk/core/marketplace/MarketplaceRuntime';
import { LicenseRuntime } from '../../../sdk/core/license/LicenseRuntime';
import { BillingRuntime } from '../../../sdk/core/billing/BillingRuntime';
import { SecurityRuntime } from '../../../sdk/core/security/SecurityRuntime';
import { SecurityContext } from '../../../sdk/core/security/SecurityModels';
import { AIOSEventBus } from '../../../sdk/core/event/AIOSEventBus';
import { RuntimeCapability } from '../../../sdk/core/runtime/RuntimeCapability';
import { ServiceDefinition, ServiceIdentity, ServiceDependency, MarketplaceEntry, MarketplaceReview, LicenseRecord } from '../../../sdk/core/service/ServiceModels';
import { IBillingProvider } from '../../../sdk/core/billing/BillingProvider';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[Assertion Failure] ${message}`);
  }
}

async function testServiceRegistryAndLifecycle() {
  console.log('[Test 1] Service Registry and Lifecycle starting...');
  const eventBus = new AIOSEventBus();
  const srvRuntime = new ServiceRuntime(eventBus);

  const service: ServiceDefinition = {
    serviceId: 'logger-plugin',
    providerId: 'provider-01',
    version: '1.0.0',
    capabilities: ['LOGGING'],
    licenseType: 'COMMERCIAL',
    billingModel: 'SUBSCRIPTION',
    status: 'ACTIVE'
  };

  const identity: ServiceIdentity = {
    serviceId: 'logger-plugin',
    publisherId: 'provider-01',
    manifestHash: 'HASH-12345',
    signature: 'SIG-VERIFIED-12345',
    certificateId: 'CERT-SRV-1',
    trustScore: 95,
    status: 'ACTIVE'
  };

  // 1. Register service
  await srvRuntime.registerService(service, identity);
  const reg = srvRuntime.getRegistry().getService('logger-plugin');
  assert(reg !== undefined, 'Service logger-plugin should be registered');

  // 2. Start and Stop service
  await srvRuntime.startService('logger-plugin');
  assert(srvRuntime.getLifecycle().getServiceState('logger-plugin') === 'RUNNING', 'Service state should be RUNNING');

  await srvRuntime.stopService('logger-plugin');
  assert(srvRuntime.getLifecycle().getServiceState('logger-plugin') === 'STOPPED', 'Service state should be STOPPED');

  // 3. Health violations stop service
  await srvRuntime.startService('logger-plugin');
  srvRuntime.getLifecycle().handleHealthViolation('logger-plugin', false); // simulated unhealthy event
  assert(srvRuntime.getLifecycle().getServiceState('logger-plugin') === 'STOPPED', 'Service should be stopped on health violation');

  console.log('[Test 1] Service Registry and Lifecycle: PASSED');
}

async function testDependencyResolution() {
  console.log('[Test 2] Dependency Policy and Resolution starting...');
  const eventBus = new AIOSEventBus();
  const srvRuntime = new ServiceRuntime(eventBus);

  const mainService: ServiceDefinition = {
    serviceId: 'main-app',
    providerId: 'provider-02',
    version: '2.0.0',
    capabilities: ['APP'],
    licenseType: 'COMMERCIAL',
    billingModel: 'FREE',
    status: 'ACTIVE'
  };

  const mainIdentity: ServiceIdentity = {
    serviceId: 'main-app',
    publisherId: 'provider-02',
    manifestHash: 'HASH-APP',
    signature: 'SIG-APP-OK',
    certificateId: 'CERT-APP',
    trustScore: 90,
    status: 'ACTIVE'
  };

  const dep: ServiceDependency = {
    serviceId: 'main-app',
    dependsOn: 'logger-plugin',
    versionConstraint: '^1.0.0',
    requiredCapabilities: ['LOGGING']
  };

  await srvRuntime.getRegistry().registerService(mainService, mainIdentity);
  srvRuntime.getResolver().registerDependencies('main-app', [dep]);

  // 1. Resolution should fail since dependency is missing
  try {
    srvRuntime.getResolver().resolveDependencies('main-app', srvRuntime.getRegistry());
    assert(false, 'Should throw error when dependency is missing');
  } catch (e: any) {
    assert(e.message.includes('Missing service dependency'), 'Expected missing dependency exception');
  }

  // 2. Register dependency, resolution must now succeed
  const depService: ServiceDefinition = {
    serviceId: 'logger-plugin',
    providerId: 'provider-01',
    version: '1.0.0',
    capabilities: ['LOGGING'],
    licenseType: 'COMMERCIAL',
    billingModel: 'SUBSCRIPTION',
    status: 'ACTIVE'
  };
  const depIdentity: ServiceIdentity = {
    serviceId: 'logger-plugin',
    publisherId: 'provider-01',
    manifestHash: 'HASH-12345',
    signature: 'SIG-VERIFIED-12345',
    certificateId: 'CERT-SRV-1',
    trustScore: 95,
    status: 'ACTIVE'
  };
  await srvRuntime.getRegistry().registerService(depService, depIdentity);

  const resolved = srvRuntime.getResolver().resolveDependencies('main-app', srvRuntime.getRegistry());
  assert(resolved.length === 1 && resolved[0].serviceId === 'logger-plugin', 'Dependency resolver did not resolve logger-plugin');

  console.log('[Test 2] Dependency Policy and Resolution: PASSED');
}

async function testMarketplaceCatalogAndReviews() {
  console.log('[Test 3] Marketplace Catalog & Review indexing starting...');
  const eventBus = new AIOSEventBus();
  const mkRuntime = new MarketplaceRuntime(eventBus);

  const entry: MarketplaceEntry = {
    entryId: 'ENT-LOGGER',
    serviceId: 'logger-plugin',
    publisherId: 'provider-01',
    visibility: 'PUBLIC',
    category: 'utilities',
    rating: 0,
    status: 'PUBLISHED'
  };

  // 1. Publish Entry
  await mkRuntime.publishService(entry);
  const found = mkRuntime.getRegistry().getEntry('ENT-LOGGER');
  assert(found !== undefined && found.status === 'PUBLISHED', 'Marketplace entry should be published');

  // 2. Submit reviews and recalculate average rating
  const review1: MarketplaceReview = {
    reviewId: 'REV-1',
    serviceId: 'logger-plugin',
    reviewerId: 'user-01',
    qualityScore: 5.0,
    trustScore: 90,
    timestamp: new Date().toISOString()
  };
  const review2: MarketplaceReview = {
    reviewId: 'REV-2',
    serviceId: 'logger-plugin',
    reviewerId: 'user-02',
    qualityScore: 3.0,
    trustScore: 80,
    timestamp: new Date().toISOString()
  };

  await mkRuntime.addServiceReview(review1);
  await mkRuntime.addServiceReview(review2);

  const updatedEntry = mkRuntime.getRegistry().getEntry('ENT-LOGGER');
  assert(updatedEntry!.rating === 4.0, 'Rating recalculation mismatch (expected 4.0)');

  // 3. Search indexing
  const results = mkRuntime.getSearch().searchByCategory('utilities');
  assert(results.length === 1 && results[0].entryId === 'ENT-LOGGER', 'Search index result mismatch');

  console.log('[Test 3] Marketplace Catalog & Review indexing: PASSED');
}

async function testLicensingAndBilling() {
  console.log('[Test 4] Licensing and Billing starting...');
  const eventBus = new AIOSEventBus();
  const licRuntime = new LicenseRuntime(eventBus);
  const billRuntime = new BillingRuntime(eventBus);

  // 1. Issue Subscription License
  const license = await licRuntime.issueLicense('LIC-TEST', 'logger-plugin', 'distributor-01');
  assert(license.status === 'ACTIVE', 'License status should start as ACTIVE');

  const verify1 = await licRuntime.validateLicense('LIC-TEST');
  assert(verify1 === true, 'Verifier should validate active license');

  // 2. Invalidation and Suspensions state machine check
  licRuntime.getManager().updateLicenseStatus('LIC-TEST', 'SUSPENDED');
  const verify2 = await licRuntime.validateLicense('LIC-TEST');
  assert(verify2 === false, 'Suspended license should fail validation checks');

  // 3. Billing Provider registration and payment charge
  const mockStripeProvider: IBillingProvider = {
    info: {
      providerId: 'STRIPE-TEST',
      providerType: 'CREDIT_CARD',
      status: 'ACTIVE',
      supportedFeatures: ['RECURRING']
    },
    charge: async (licenseeId, amount) => {
      // Return mock payment approval status
      return amount === 100;
    },
    refund: async () => true
  };

  billRuntime.getRegistry().registerProvider(mockStripeProvider);
  
  // Successful transaction
  const tx1 = await billRuntime.processPayment('STRIPE-TEST', 'distributor-01', 'logger-plugin', 100);
  assert(tx1.status === 'PAID', 'Mock charge transaction should be PAID');

  // Failed transaction due to amount restriction
  const tx2 = await billRuntime.processPayment('STRIPE-TEST', 'distributor-01', 'logger-plugin', 50);
  assert(tx2.status === 'FAILED', 'Transaction must fail for invalid charge parameters');

  console.log('[Test 4] Licensing and Billing: PASSED');
}

async function testSecurityAuthorizationHook() {
  console.log('[Test 5] Security Runtime License Checks starting...');
  const eventBus = new AIOSEventBus();
  const licRuntime = new LicenseRuntime(eventBus);
  const securityRuntime = new SecurityRuntime(eventBus);

  await securityRuntime.start();
  securityRuntime.setLicenseRuntime(licRuntime);

  const secCtx: SecurityContext = {
    contextId: 'CTX-TEST-S',
    runtimeId: 'core.runtime',
    principalId: 'distributor-01',
    sessionId: 'sess-license',
    trustLevel: 'HIGH',
    capabilities: ['*']
  };

  // 1. Request access without a license registration: should be DENIED
  const auth1 = await securityRuntime.authorize(secCtx, 'service:logger-plugin', 'execute');
  assert(auth1.result === 'DENY', 'Authorization must be denied for unlicensed services');
  assert(auth1.reason.includes('No active license found'), 'Expected missing license reason');

  // 2. Issue a valid license: access should be ALLOWED
  await licRuntime.issueLicense('LIC-LOGGER', 'logger-plugin', 'distributor-01');
  const auth2 = await securityRuntime.authorize(secCtx, 'service:logger-plugin', 'execute');
  assert(auth2.result === 'ALLOW', 'Authorization should allow access with an active license');

  // 3. Mark license EXPIRED: access should be DENIED
  licRuntime.getManager().updateLicenseStatus('LIC-LOGGER', 'EXPIRED');
  const auth3 = await securityRuntime.authorize(secCtx, 'service:logger-plugin', 'execute');
  assert(auth3.result === 'DENY', 'Authorization must deny access for expired licenses');
  assert(auth3.reason.includes('invalid or expired'), 'Expected invalid or expired license reason');

  console.log('[Test 5] Security Runtime License Checks: PASSED');
}

async function testDiscoveryCapabilities() {
  console.log('[Test 6] Marketplace Capabilities starting...');
  const eventBus = new AIOSEventBus();
  const mkRuntime = new MarketplaceRuntime(eventBus);
  const licRuntime = new LicenseRuntime(eventBus);

  assert(mkRuntime.descriptor.capabilities.includes(RuntimeCapability.MARKETPLACE), 'MARKETPLACE capability missing');
  assert(licRuntime.descriptor.capabilities.includes(RuntimeCapability.SUBSCRIPTION), 'SUBSCRIPTION capability missing');
  console.log('[Test 6] Marketplace Capabilities: PASSED');
}

async function runAll() {
  console.log('--- Starting Service & Marketplace Runtime Tests ---');
  await testServiceRegistryAndLifecycle();
  await testDependencyResolution();
  await testMarketplaceCatalogAndReviews();
  await testLicensingAndBilling();
  await testSecurityAuthorizationHook();
  await testDiscoveryCapabilities();
  console.log('--- All Service & Marketplace Runtime Tests PASSED ---');
}

runAll().catch(err => {
  console.error('[Test Suite Error]', err);
  process.exit(1);
});
