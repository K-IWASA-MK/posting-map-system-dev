/**
 * OutputPolicyModels.ts
 * 
 * AIOS Output Policy Domain Models
 */

export type PrimaryOutputLanguage = 'JA';
export type TechnicalElementLanguage = 'EN';

export interface OutputPolicy {
  readonly primaryLanguage: PrimaryOutputLanguage;
  readonly allowEnglishTechnicalTerms: boolean;
  readonly rules: ReadonlyArray<string>;
  readonly specificationVersion: string;
}
