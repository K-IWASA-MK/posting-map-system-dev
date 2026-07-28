/**
 * KnowledgeSanitizationPolicy.ts
 * 
 * Implements Principle 005 (Knowledge Sanitization Principle).
 * Defines rules and verification specs to ensure registered knowledge items are stripped
 * of project-specific identifiers and confidential attributes before platform indexing.
 */

export interface SanitizationRequirement {
  readonly stripProjectIdentifiers: true;
  readonly stripSecretsAndCredentials: true;
  readonly stripCustomerSpecificData: true;
  readonly generalizeToPlatformAsset: true;
}

export interface KnowledgeSanitizationResult {
  readonly isSanitized: boolean;
  readonly detectedProjectLeaks: readonly string[];
  readonly sanitizedContentSummary?: string;
}

export class KnowledgeSanitizationPolicy {
  public static readonly DEFAULT_REQUIREMENTS: SanitizationRequirement = Object.freeze({
    stripProjectIdentifiers: true,
    stripSecretsAndCredentials: true,
    stripCustomerSpecificData: true,
    generalizeToPlatformAsset: true
  });

  public static verifySanitization(
    content: string,
    knownProjectIdentifiers: string[] = []
  ): KnowledgeSanitizationResult {
    const detectedLeaks: string[] = [];

    for (const id of knownProjectIdentifiers) {
      if (id && content.includes(id)) {
        detectedLeaks.push(`Project Identifier Leak: '${id}'`);
      }
    }

    // Check for common sensitive patterns (e.g. api keys, passwords, bearer tokens)
    if (/api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9_\-]+['"]/i.test(content)) {
      detectedLeaks.push('Potential API Key pattern detected');
    }
    if (/password\s*[:=]\s*['"][^'"]+['"]/i.test(content)) {
      detectedLeaks.push('Potential Password pattern detected');
    }

    return Object.freeze({
      isSanitized: detectedLeaks.length === 0,
      detectedProjectLeaks: Object.freeze(detectedLeaks),
      sanitizedContentSummary: detectedLeaks.length === 0 ? 'Cleaned & Generalized' : undefined
    });
  }
}
