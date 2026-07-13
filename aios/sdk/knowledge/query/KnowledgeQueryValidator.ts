import { KnowledgeQueryRequest } from './KnowledgeQueryRequest';

export class KnowledgeQueryValidator {
  public static validate(request: KnowledgeQueryRequest): void {
    if (!request.queryId || request.queryId.trim() === '') {
      throw new Error("KnowledgeQueryRequest.queryId is required");
    }

    if (!request.schemaVersion || request.schemaVersion.trim() === '') {
      throw new Error("KnowledgeQueryRequest.schemaVersion is required");
    }

    if (request.limit !== undefined && request.limit <= 0) {
      throw new Error(`KnowledgeQueryRequest.limit must be greater than 0, got ${request.limit}`);
    }

    if (request.offset !== undefined && request.offset < 0) {
      throw new Error(`KnowledgeQueryRequest.offset must be >= 0, got ${request.offset}`);
    }

    if (request.version !== undefined && request.version < 1) {
      throw new Error(`KnowledgeQueryRequest.version must be >= 1 for approved queries, got ${request.version}`);
    }

    if (request.knowledgeId !== undefined && request.knowledgeId.trim() === '') {
      throw new Error("KnowledgeQueryRequest.knowledgeId cannot be empty if specified");
    }

    if (request.nodeId !== undefined && request.nodeId.trim() === '') {
      throw new Error("KnowledgeQueryRequest.nodeId cannot be empty if specified");
    }

    if (request.patternId !== undefined && request.patternId.trim() === '') {
      throw new Error("KnowledgeQueryRequest.patternId cannot be empty if specified");
    }
  }
}
