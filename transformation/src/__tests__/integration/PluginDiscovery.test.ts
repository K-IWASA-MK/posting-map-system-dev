import { PluginDiscoveryRequest, PluginCandidate } from '../../engine/discovery/models';
import { IDiscoverySource } from '../../engine/discovery/interfaces';
import { PluginOrigin, PluginCapability } from '../../models/plugin';
import { LocalDiscoverySource } from '../../engine/discovery/local/LocalDiscoverySource';
import { DefaultRankingEngine } from '../../engine/discovery/RankingEngine';
import { DefaultPluginSelector } from '../../engine/discovery/Selector';
import { PluginResolver } from '../../engine/discovery/PluginResolver';
import { ManifestReader } from '../../engine/discovery/local/ManifestReader';
import { DirectoryScanner } from '../../engine/discovery/local/DirectoryScanner';

describe('Plugin Discovery Foundation Integration Tests (Sprint X-25)', () => {

  const mockManifest1 = {
    pluginId: 'com.example.worker-1',
    name: 'Worker 1',
    version: '1.0.0',
    minimumApiVersion: '1.0.0',
    maximumApiVersion: '2.0.0',
    kind: 'WORKER' as const,
    capabilities: [PluginCapability.EXECUTE]
  };

  const mockManifest2 = {
    pluginId: 'com.example.projector-1',
    name: 'Projector 1',
    version: '2.0.0',
    minimumApiVersion: '1.0.0',
    maximumApiVersion: '3.0.0',
    kind: 'PROJECTOR' as const,
    capabilities: [PluginCapability.PROJECT]
  };

  const mockCandidate1: PluginCandidate = {
    manifest: mockManifest1,
    location: '/mock/plugins/worker-1',
    source: PluginOrigin.LOCAL,
    trust: 100,
    priority: 0,
    score: 0
  };

  const mockCandidate2: PluginCandidate = {
    manifest: mockManifest2,
    location: '/mock/plugins/projector-1',
    source: PluginOrigin.LOCAL,
    trust: 90,
    priority: 10,
    score: 0
  };

  // Mock Source for testing multiple sources
  class MockDiscoverySource implements IDiscoverySource {
    public readonly sourceName = 'MOCK_SOURCE';
    constructor(private readonly candidates: PluginCandidate[]) {}
    async discover(request: PluginDiscoveryRequest): Promise<readonly PluginCandidate[]> {
      return this.candidates;
    }
  }

  describe('Discovery-001: Request', () => {
    it('should properly type and handle requests', () => {
      const request: PluginDiscoveryRequest = {
        kind: 'WORKER',
        capabilities: [PluginCapability.EXECUTE],
        targetApiVersion: '1.5.0'
      };
      expect(request.kind).toBe('WORKER');
      expect(request.capabilities).toContain(PluginCapability.EXECUTE);
    });
  });

  describe('Discovery-002: Local Source', () => {
    it('should discover candidates from local filesystem safely', async () => {
      // Mock scanner and reader to simulate fs
      class MockScanner extends DirectoryScanner {
        async scan(basePath: string): Promise<readonly string[]> {
          return ['/mock/dir1'];
        }
      }
      class MockReader extends ManifestReader {
        async read(path: string) {
          return mockManifest1;
        }
      }

      const localSource = new LocalDiscoverySource(['/plugins'], new MockScanner(), new MockReader());
      const request: PluginDiscoveryRequest = {};
      const candidates = await localSource.discover(request);

      expect(candidates.length).toBe(1);
      expect(candidates[0].manifest.pluginId).toBe('com.example.worker-1');
      expect(candidates[0].source).toBe(PluginOrigin.LOCAL);
      expect(candidates[0].trust).toBe(100);
    });
  });

  describe('Discovery-003: Ranking', () => {
    const engine = new DefaultRankingEngine();

    it('should rank exact pluginId match highest', () => {
      const request: PluginDiscoveryRequest = { pluginId: 'com.example.projector-1' };
      const ranked = engine.rank([mockCandidate1, mockCandidate2], request);
      
      expect(ranked.length).toBe(2);
      expect(ranked[0].manifest.pluginId).toBe('com.example.projector-1');
      expect(ranked[0].score).toBeGreaterThan(10000);
      expect(ranked[1].score).toBe(-1); // Worker 1 was rejected (-1)
    });

    it('should rank by kind and capabilities', () => {
      const request: PluginDiscoveryRequest = { 
        kind: 'WORKER',
        capabilities: [PluginCapability.EXECUTE]
      };
      const ranked = engine.rank([mockCandidate1, mockCandidate2], request);
      
      expect(ranked[0].manifest.pluginId).toBe('com.example.worker-1');
      expect(ranked[0].score).toBeGreaterThan(1000);
      expect(ranked[1].score).toBe(-1); // Projector rejected
    });
  });

  describe('Discovery-004: Selector', () => {
    it('should select the best non-rejected candidate', () => {
      const engine = new DefaultRankingEngine();
      const selector = new DefaultPluginSelector();
      
      const request: PluginDiscoveryRequest = { kind: 'WORKER' };
      const ranked = engine.rank([mockCandidate1, mockCandidate2], request);
      const best = selector.select(ranked, request);

      expect(best).toBeDefined();
      expect(best?.manifest.pluginId).toBe('com.example.worker-1');
    });

    it('should return undefined if all are rejected', () => {
      const engine = new DefaultRankingEngine();
      const selector = new DefaultPluginSelector();
      
      const request: PluginDiscoveryRequest = { pluginId: 'com.example.unknown' };
      const ranked = engine.rank([mockCandidate1, mockCandidate2], request);
      const best = selector.select(ranked, request);

      expect(best).toBeUndefined();
    });
  });

  describe('Discovery-005: Resolver', () => {
    it('should coordinate Source, Ranking, and Selector', async () => {
      const source = new MockDiscoverySource([mockCandidate1, mockCandidate2]);
      const resolver = new PluginResolver(
        [source], 
        new DefaultRankingEngine(), 
        new DefaultPluginSelector()
      );

      const best = await resolver.discoverBest({ kind: 'PROJECTOR' });
      
      expect(best).toBeDefined();
      expect(best?.manifest.pluginId).toBe('com.example.projector-1');
    });
  });

  describe('Discovery-006: No Side Effects', () => {
    it('must not mutate the original candidates array during ranking', () => {
      const candidates = [mockCandidate1, mockCandidate2];
      const originalScores = candidates.map(c => c.score);
      
      const engine = new DefaultRankingEngine();
      engine.rank(candidates, { kind: 'WORKER' });
      
      // Original candidates should still have a score of 0
      expect(candidates.map(c => c.score)).toEqual(originalScores);
    });
  });

  describe('Discovery-007: Multiple Sources', () => {
    it('should aggregate candidates from multiple sources transparently', async () => {
      const sourceA = new MockDiscoverySource([mockCandidate1]);
      const sourceB = new MockDiscoverySource([mockCandidate2]);
      
      const resolver = new PluginResolver(
        [sourceA, sourceB], 
        new DefaultRankingEngine(), 
        new DefaultPluginSelector()
      );

      const all = await resolver.discoverAll({});
      expect(all.length).toBe(2);
      
      const ids = all.map(c => c.manifest.pluginId);
      expect(ids).toContain('com.example.worker-1');
      expect(ids).toContain('com.example.projector-1');
    });
  });

  describe('Discovery-008: Stable Ranking', () => {
    it('should return deterministic results for identical conditions', () => {
      const engine = new DefaultRankingEngine();
      const request: PluginDiscoveryRequest = {};
      
      // Ranking multiple times should yield exactly the same order and scores
      const ranked1 = engine.rank([mockCandidate1, mockCandidate2], request);
      const ranked2 = engine.rank([mockCandidate1, mockCandidate2], request);
      
      expect(ranked1[0].manifest.pluginId).toBe(ranked2[0].manifest.pluginId);
      expect(ranked1[1].manifest.pluginId).toBe(ranked2[1].manifest.pluginId);
      expect(ranked1[0].score).toBe(ranked2[0].score);
    });
  });

});
