import * as crypto from 'crypto';

export class KnowledgeDatasetIdGenerator {
  public static generate(patternIds: ReadonlyArray<string>): string {
    const sortedIds = [...patternIds].sort((a, b) => a.localeCompare(b));
    const hash = crypto.createHash('sha256')
      .update(sortedIds.join(','))
      .digest('hex')
      .substring(0, 16);
    return `KDS-${hash}`;
  }
}
