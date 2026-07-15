import { IKnowledgeQueryService } from './IKnowledgeQueryService';
import { IKnowledgeRepository } from '../repository/IKnowledgeRepository';
import { KnowledgeAsset } from '../contracts/KnowledgeAsset';
import { KnowledgeQueryRequest } from './KnowledgeQueryRequest';
import { KnowledgeQueryResult } from './KnowledgeQueryResult';
import { KnowledgeQueryValidator } from './KnowledgeQueryValidator';
import * as crypto from 'crypto';

export class KnowledgeQueryService implements IKnowledgeQueryService {
  constructor(private readonly repository: IKnowledgeRepository) {}

  public async query(request: KnowledgeQueryRequest): Promise<KnowledgeQueryResult> {
    const startTime = Date.now();

    // 1. Validation
    KnowledgeQueryValidator.validate(request);

    const all = await this.repository.findAll();
    let filtered = [...all];

    // 2. Apply filters
    if (request.knowledgeId) {
      filtered = filtered.filter(a => a.knowledgeId === request.knowledgeId);
    }
    if (request.version !== undefined) {
      filtered = filtered.filter(a => a.version === request.version);
    }
    if (request.nodeId) {
      filtered = filtered.filter(a => a.semantic.nodes.some(n => n.nodeId === request.nodeId));
    }
    if (request.patternId) {
      filtered = filtered.filter(a => a.metadata.sourcePatternIds.includes(request.patternId!));
    }
    if (request.edgeType) {
      filtered = filtered.filter(a => a.semantic.edges.some(e => e.type === request.edgeType));
    }
    if (request.ruleType) {
      filtered = filtered.filter(a => a.logicalRules.some(r => r.ruleType === request.ruleType));
    }

    // 3. Facade-level Canonical Sort Final Assurance
    filtered.sort((a, b) => {
      const idComp = a.knowledgeId.localeCompare(b.knowledgeId);
      if (idComp !== 0) return idComp;
      return a.version - b.version;
    });

    const totalCount = filtered.length;

    // 4. Apply pagination
    const offset = request.offset || 0;
    const limit = request.limit !== undefined ? request.limit : totalCount;
    const paginated = filtered.slice(offset, offset + limit);

    const hasNextPage = offset + limit < totalCount;
    const nextOffset = hasNextPage ? offset + limit : undefined;

    // Deterministic resultId based on query request content
    const requestHash = crypto.createHash('sha256')
      .update(JSON.stringify(request))
      .digest('hex')
      .substring(0, 16);
    const resultId = `QRES-${requestHash}`;

    const durationMs = Date.now() - startTime;

    return Object.freeze({
      requestId: request.queryId,
      resultId,
      schemaVersion: '1.0.0',
      // Runtime Metadata (Not part of Knowledge Asset)
      generatedAt: new Date().toISOString(),
      durationMs,
      assets: Object.freeze(paginated.map(a => Object.freeze(a))),
      totalCount,
      returnedCount: paginated.length,
      hasNextPage,
      nextOffset
    });
  }

  public async findById(knowledgeId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    return this.repository.findById(knowledgeId);
  }

  public async findLatestVersion(knowledgeId: string): Promise<KnowledgeAsset | undefined> {
    return this.repository.findLatestVersion(knowledgeId);
  }

  public async findByPatternId(patternId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    return this.repository.findByPatternId(patternId);
  }

  public async findByNodeId(nodeId: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    return this.repository.findByNodeId(nodeId);
  }

  public async findAll(): Promise<ReadonlyArray<KnowledgeAsset>> {
    return this.repository.findAll();
  }

  public async count(): Promise<number> {
    return this.repository.count();
  }

  public async findByEdgeType(edgeType: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    const all = await this.repository.findAll();
    const matched = all.filter(a => a.semantic.edges.some(e => e.type === edgeType));
    return Object.freeze(matched);
  }

  public async findByRuleType(ruleType: string): Promise<ReadonlyArray<KnowledgeAsset>> {
    const all = await this.repository.findAll();
    const matched = all.filter(a => a.logicalRules.some(r => r.ruleType === ruleType));
    return Object.freeze(matched);
  }
}
