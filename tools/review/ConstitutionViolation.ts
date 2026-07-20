export interface ConstitutionViolation {
  readonly articleId: string;
  readonly message: string;
  readonly severity: 'WARNING' | 'ERROR' | 'VETO';
}
