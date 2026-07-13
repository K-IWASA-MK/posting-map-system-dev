import { PatternQueryRequest } from './PatternQueryRequest';

export class PatternQueryValidator {
  public static validate(request: PatternQueryRequest): void {
    if (request.limit !== undefined && request.limit <= 0) {
      throw new Error(`Invalid limit: ${request.limit}. Must be > 0.`);
    }

    if (request.offset !== undefined && request.offset < 0) {
      throw new Error(`Invalid offset: ${request.offset}. Must be >= 0.`);
    }

    if (request.createdAfter && request.createdBefore) {
      const after = new Date(request.createdAfter).getTime();
      const before = new Date(request.createdBefore).getTime();
      if (after > before) {
        throw new Error(`Invalid date range: createdAfter (${request.createdAfter}) cannot be after createdBefore (${request.createdBefore}).`);
      }
    }
  }
}
