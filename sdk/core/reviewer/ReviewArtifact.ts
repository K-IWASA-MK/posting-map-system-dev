export interface ReviewArtifact {
  readonly id: string;
  readonly type: 'CODE_FIX' | 'DIFF' | 'MARKDOWN' | 'DIAGRAM' | 'JSON' | 'OTHER';
  readonly title: string;
  readonly content: string;
  readonly language?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
