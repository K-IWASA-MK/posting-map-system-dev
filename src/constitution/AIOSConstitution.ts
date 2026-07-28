/**
 * AIOSConstitution.ts
 * 
 * Supreme Governance Foundation model of the AIOS Platform.
 * Version 1.0
 * 
 * Contains immutable Principles 001 to 006, Rules, and validation helpers.
 */

import { ConstitutionPrinciple, STANDARD_PRINCIPLES } from './ConstitutionPrinciple';
import { ConstitutionRule, STANDARD_RULES } from './ConstitutionRule';
import { ArtifactOwnership, ArtifactOwnershipDescriptor } from './ArtifactOwnership';
import { KnowledgeBoundary } from './KnowledgeBoundary';
import { DispatchPolicy, DispatchRequirement } from './DispatchPolicy';
import { KnowledgeSanitizationPolicy, KnowledgeSanitizationResult } from './KnowledgeSanitizationPolicy';

export class AIOSConstitution {
  public readonly version: string = '1.0';
  public readonly principles: readonly ConstitutionPrinciple[];
  public readonly rules: readonly ConstitutionRule[];

  constructor(
    principles: readonly ConstitutionPrinciple[] = STANDARD_PRINCIPLES,
    rules: readonly ConstitutionRule[] = STANDARD_RULES,
    version: string = '1.0'
  ) {
    this.version = version;
    this.principles = Object.freeze([...principles]);
    this.rules = Object.freeze([...rules]);
    Object.freeze(this);
  }

  private static readonly INSTANCE: AIOSConstitution = new AIOSConstitution();

  public static getV1(): AIOSConstitution {
    return AIOSConstitution.INSTANCE;
  }

  public getPrinciple(idOrCode: string): ConstitutionPrinciple | undefined {
    return this.principles.find(p => p.id === idOrCode || p.code === idOrCode);
  }

  public getRulesForPrinciple(principleId: string): readonly ConstitutionRule[] {
    return this.rules.filter(r => r.principleId === principleId);
  }

  public withPrinciple(newPrinciple: ConstitutionPrinciple): AIOSConstitution {
    if (this.getPrinciple(newPrinciple.id) || this.getPrinciple(newPrinciple.code)) {
      throw new Error(`[AIOSConstitution] Principle with ID/Code '${newPrinciple.id}/${newPrinciple.code}' already exists`);
    }
    const updatedPrinciples = Object.freeze([...this.principles, Object.freeze(newPrinciple)]);
    return new AIOSConstitution(updatedPrinciples, this.rules, this.version);
  }

  public validateArtifactOwnership(artifactId: string, projectId: string): ArtifactOwnershipDescriptor {
    const descriptor = ArtifactOwnership.createProjectOwnership(artifactId, projectId);
    const result = ArtifactOwnership.validateOwnership(descriptor);
    if (!result.valid) {
      throw new Error(`[AIOSConstitution Violation] ${result.error}`);
    }
    return descriptor;
  }

  public validateKnowledgeRetention(category: string): { allowed: boolean; reason: string } {
    return KnowledgeBoundary.evaluateCategory(category);
  }

  public validateDispatchRequirement(requirement: DispatchRequirement): { valid: boolean; reason?: string } {
    return DispatchPolicy.validateDispatch(requirement);
  }

  public validateKnowledgeSanitization(content: string, projectIds: string[] = []): KnowledgeSanitizationResult {
    return KnowledgeSanitizationPolicy.verifySanitization(content, projectIds);
  }
}
