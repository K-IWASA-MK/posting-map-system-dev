export interface ConstitutionArticle {
  readonly id: string;
  readonly title: string;
  readonly category: 'SECURITY' | 'ARCHITECTURE' | 'GOVERNANCE' | 'QUALITY';
  readonly description: string;
  readonly severity: 'WARNING' | 'ERROR' | 'VETO';
  readonly version: string;
  readonly enabled: boolean;
}
