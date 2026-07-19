import { PolicyBundle, PolicyDefinition } from './GovernanceModels';
import { GovernanceRegistry } from './GovernanceRegistry';

export class GovernancePolicyLoader {
  constructor(private readonly registry: GovernanceRegistry) {}

  public loadDefaultBundle(version = '1.0.0'): PolicyBundle {
    const policies: PolicyDefinition[] = [
      {
        policyId: 'POL-SEC-001',
        name: 'Strict Security Access',
        version: '1.0.0',
        scope: 'GLOBAL',
        priority: 1,
        state: 'ACTIVE',
        checksum: 'MOCK-SEC'
      },
      {
        policyId: 'POL-RUN-001',
        name: 'Runtime Separation Integrity',
        version: '1.0.0',
        scope: 'RUNTIME',
        priority: 2,
        state: 'ACTIVE',
        checksum: 'MOCK-RUN'
      },
      {
        policyId: 'POL-PLG-001',
        name: 'Plugin Isolation Boundary',
        version: '1.0.0',
        scope: 'PLUGIN',
        priority: 3,
        state: 'ACTIVE',
        checksum: 'MOCK-PLG'
      }
    ];

    const checksum = this.registry.calculateChecksum(policies);

    const bundle: PolicyBundle = {
      bundleId: `BND-${version}-${Date.now()}`,
      version,
      policies,
      checksum,
      createdAt: new Date().toISOString()
    };

    return bundle;
  }
}
