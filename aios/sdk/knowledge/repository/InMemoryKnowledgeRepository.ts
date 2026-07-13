import { IKnowledgeRepository } from './IKnowledgeRepository';
import { KnowledgeAsset } from '../contracts/KnowledgeAsset';
import { KnowledgeRepositoryValidator } from './KnowledgeRepositoryValidator';

export class InMemoryKnowledgeRepository implements IKnowledgeRepository {
  private readonly store = new Map<string, KnowledgeAsset[]>();

  public async save(asset: KnowledgeAsset): Promise<void> {
    KnowledgeRepositoryValidator.validate(asset);

    const versions = this.store.get(asset.knowledgeId) || [];
    
    if (versions.some(v => v.version === asset.version)) {
      throw new Error(`KnowledgeAsset ${asset.knowledgeId} with version ${asset.version} already exists`);
    }

    versions.push(asset);
    versions.sort((a, b) => a.version - b.version);
    this.store.set(asset.knowledgeId, versions);
  }

  public async findById(knowledgeId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    const versions = this.store.get(knowledgeId) || [];
    return Object.freeze([...versions]);
  }

  public async findLatestVersion(knowledgeId: string): Promise<KnowledgeAsset | undefined> {
    const versions = this.store.get(knowledgeId) || [];
    if (versions.length === 0) return undefined;
    return versions[versions.length - 1];
  }

  public async findAll(): Promise<ReadonlyArray<KnowledgeAsset>> {
    const allAssets: KnowledgeAsset[] = [];
    this.store.forEach(versions => {
      allAssets.push(...versions);
    });

    // Deterministic Canonical Sorting (knowledgeId ASC -> version ASC)
    allAssets.sort((a, b) => {
      const idComp = a.knowledgeId.localeCompare(b.knowledgeId);
      if (idComp !== 0) return idComp;
      return a.version - b.version;
    });

    return Object.freeze(allAssets);
  }

  public async count(): Promise<number> {
    let total = 0;
    this.store.forEach(versions => {
      total += versions.length;
    });
    return total;
  }

  public async findByPatternId(patternId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    // TODO: Migrate to SQLite/GraphDB PatternIndex in the future
    const matched: KnowledgeAsset[] = [];
    this.store.forEach(versions => {
      for (const asset of versions) {
        if (asset.metadata.sourcePatternIds.includes(patternId)) {
          matched.push(asset);
        }
      }
    });
    return Object.freeze(matched);
  }

  public async findByNodeId(nodeId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    // TODO: Migrate to SQL NodeIndex/GraphIndex table in the future
    const matched: KnowledgeAsset[] = [];
    this.store.forEach(versions => {
      for (const asset of versions) {
        const hasNode = asset.semantic.nodes.some(n => n.nodeId === nodeId);
        if (hasNode) {
          matched.push(asset);
        }
      }
    });
    return Object.freeze(matched);
  }

  public clear(): void {
    this.store.clear();
  }
}
