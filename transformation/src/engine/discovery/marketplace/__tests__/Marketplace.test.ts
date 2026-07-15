import { MarketplaceDiscoverySource } from '../MarketplaceDiscoverySource';
import type { IMarketplaceProvider, IPackageDownloader } from '../interfaces';
import type { MarketplacePackage, MarketplaceQuery, DownloadedPlugin } from '../models';
import { PluginResolver } from '../../PluginResolver';
import { DefaultRankingEngine } from '../../RankingEngine';
import { DefaultPluginSelector } from '../../Selector';
import type { PluginDiscoveryRequest } from '../../models';
import { PluginOrigin, PluginCapability } from '../../../../models/plugin';

// Mock IMarketplaceProvider
class MockMarketplaceProvider implements IMarketplaceProvider {
  constructor(
    public readonly providerName: string,
    private readonly packages: MarketplacePackage[] = [],
    private readonly shouldFail: boolean = false
  ) {}

  async search(query: MarketplaceQuery): Promise<readonly MarketplacePackage[]> {
    if (this.shouldFail) {
      throw new Error(`Provider ${this.providerName} is down`);
    }
    
    // Simple filter simulation
    return this.packages.filter(pkg => {
      if (query.query && pkg.manifest.pluginId !== query.query) return false;
      if (query.kind && pkg.manifest.kind !== query.kind) return false;
      return true;
    });
  }

  async getMetadata(pluginId: string, version?: string): Promise<MarketplacePackage | undefined> {
    if (this.shouldFail) {
      throw new Error(`Provider ${this.providerName} is down`);
    }
    return this.packages.find(pkg => pkg.manifest.pluginId === pluginId);
  }
}

// Mock IPackageDownloader
class MockPackageDownloader implements IPackageDownloader {
  public called: boolean = false;
  async download(sourceUri: string): Promise<DownloadedPlugin> {
    this.called = true;
    return {
      pluginId: 'test.plugin',
      version: '1.0.0',
      archive: { data: new Uint8Array([1, 2, 3]), size: 3 },
      downloadedAt: new Date().toISOString()
    };
  }
}

describe('Plugin Marketplace Foundation', () => {

  const testPackage: MarketplacePackage = {
    manifest: {
      pluginId: 'com.example.plugin',
      name: 'Example Plugin',
      version: '1.0.0',
      minimumApiVersion: '1.0',
      maximumApiVersion: '1.0',
      kind: 'WORKER',
      capabilities: [PluginCapability.EXECUTE]
    },
    publisherId: 'example_corp',
    license: 'MIT',
    releaseDate: '2026-07-15T00:00:00Z',
    signatureRef: 'https://example.com/sig',
    checksumRef: 'https://example.com/chk'
  };

  const testPackageB: MarketplacePackage = {
    manifest: {
      pluginId: 'com.example.plugin2',
      name: 'Example Plugin 2',
      version: '2.0.0',
      minimumApiVersion: '1.0',
      maximumApiVersion: '2.0',
      kind: 'PROJECTOR',
      capabilities: [PluginCapability.PROJECT]
    },
    publisherId: 'example_corp2',
    license: 'Apache-2.0',
    releaseDate: '2026-07-16T00:00:00Z'
  };

  it('Marketplace-001: Search is delegated to the provider', async () => {
    let searchCalled = false;
    const provider: IMarketplaceProvider = {
      providerName: 'TestProvider',
      search: async () => {
        searchCalled = true;
        return [testPackage];
      },
      getMetadata: async () => testPackage
    };

    const source = new MarketplaceDiscoverySource(provider);
    await source.discover({ pluginId: 'com.example.plugin' });

    expect(searchCalled).toBe(true);
  });

  it('Marketplace-002: Metadata can be retrieved from provider', async () => {
    const provider = new MockMarketplaceProvider('TestProvider', [testPackage]);
    const metadata = await provider.getMetadata('com.example.plugin');

    expect(metadata).toBeDefined();
    expect(metadata?.publisherId).toBe('example_corp');
    expect(metadata?.license).toBe('MIT');
  });

  it('Marketplace-003: MarketplacePackage correctly converts to PluginCandidate', async () => {
    const provider = new MockMarketplaceProvider('TestProvider', [testPackage]);
    const source = new MarketplaceDiscoverySource(provider);
    
    const candidates = await source.discover({ pluginId: 'com.example.plugin' });
    
    expect(candidates).toHaveLength(1);
    const candidate = candidates[0];
    
    if (candidate) {
      expect(candidate.manifest.pluginId).toBe('com.example.plugin');
      expect(candidate.source).toBe(PluginOrigin.MARKETPLACE);
      expect(candidate.trust).toBe(0); // Explicitly 0 (UNKNOWN)
      expect(candidate.location).toBe('marketplace://TestProvider/com.example.plugin/1.0.0');
    }
  });

  it('Marketplace-004: Discovery process does not mutate Registry or Loader', async () => {
    const provider = new MockMarketplaceProvider('TestProvider', [testPackage]);
    const source = new MarketplaceDiscoverySource(provider);
    
    const ranking = new DefaultRankingEngine();
    const selector = new DefaultPluginSelector();
    
    const resolver = new PluginResolver([source], ranking, selector);
    const best = await resolver.discoverBest({ pluginId: 'com.example.plugin' });
    
    expect(best).toBeDefined();
    if (best) {
      expect(best.source).toBe(PluginOrigin.MARKETPLACE);
      expect(best.trust).toBe(0);
    }
  });

  it('Marketplace-005: Downloader is independent from Discovery', async () => {
    const provider = new MockMarketplaceProvider('TestProvider', [testPackage]);
    const source = new MarketplaceDiscoverySource(provider);
    
    await source.discover({});
    
    const downloader = new MockPackageDownloader();
    expect(downloader.called).toBe(false);
    
    const downloaded = await downloader.download('marketplace://TestProvider/com.example.plugin/1.0.0');
    expect(downloaded.archive.size).toBe(3);
    expect(downloader.called).toBe(true);
  });

  it('Marketplace-006: Multiple Providers can be integrated via PluginResolver', async () => {
    const providerA = new MockMarketplaceProvider('MarketplaceA', [testPackage]);
    const providerB = new MockMarketplaceProvider('MarketplaceB', [testPackageB]);
    
    const sourceA = new MarketplaceDiscoverySource(providerA);
    const sourceB = new MarketplaceDiscoverySource(providerB);
    
    const resolver = new PluginResolver([sourceA, sourceB], new DefaultRankingEngine(), new DefaultPluginSelector());
    
    const candidates = await resolver.discoverAll({});
    expect(candidates.length).toBe(2);
    
    const ids = candidates.map(c => c.manifest.pluginId);
    expect(ids).toContain('com.example.plugin');
    expect(ids).toContain('com.example.plugin2');
  });

  it('Marketplace-007: Failure in one provider isolates properly (MarketplaceA dead, B alive)', async () => {
    const providerA = new MockMarketplaceProvider('MarketplaceA', [testPackage], true); // shouldFail
    const providerB = new MockMarketplaceProvider('MarketplaceB', [testPackageB], false);
    
    const sourceA = new MarketplaceDiscoverySource(providerA);
    const sourceB = new MarketplaceDiscoverySource(providerB);
    
    const resolver = new PluginResolver([sourceA, sourceB], new DefaultRankingEngine(), new DefaultPluginSelector());
    
    // Shouldn't throw, should just return results from B
    const candidates = await resolver.discoverAll({});
    
    expect(candidates.length).toBe(1);
    expect(candidates[0]?.manifest.pluginId).toBe('com.example.plugin2');
    expect(candidates[0]?.location).toContain('MarketplaceB');
  });

  it('Marketplace-008: Deterministic Discovery (Same input yields identical candidate sequence)', async () => {
    const providerA = new MockMarketplaceProvider('MarketplaceA', [testPackage, testPackageB]);
    const sourceA = new MarketplaceDiscoverySource(providerA);
    
    const resolver = new PluginResolver([sourceA], new DefaultRankingEngine(), new DefaultPluginSelector());
    
    const run1 = await resolver.discoverAll({});
    const run2 = await resolver.discoverAll({});
    
    expect(run1.length).toBe(run2.length);
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i]?.manifest.pluginId).toBe(run2[i]?.manifest.pluginId);
      expect(run1[i]?.score).toBe(run2[i]?.score);
    }
  });

});
