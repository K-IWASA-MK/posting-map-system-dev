import { ConstitutionArticle } from './ConstitutionArticle';

export class ConstitutionRegistry {
  public static readonly version = '1.1.0';
  public static readonly effectiveDate = '2026-07-21';
  public static readonly minimumCompatibleVersion = '1.0.0';
  public static readonly supersedes = '1.0.0';

  private static readonly articles: ConstitutionArticle[] = [
    {
      id: 'C-001',
      title: 'Project Boundary Isolation',
      category: 'ARCHITECTURE',
      description: 'Applications and features must stay strictly isolated inside their designated namespaces. Writing business files to root-level folders is prohibited.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-002',
      title: 'Ownership Preservation',
      category: 'GOVERNANCE',
      description: 'Tasks belonging to application projects must not modify platform core code, scripts, or operational SDK structures.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-003',
      title: 'No Secret Exposure',
      category: 'SECURITY',
      description: 'Never write, store, or output passwords, private credentials, or clear-text API keys within developer plans, plan codes, or review databases.',
      severity: 'VETO',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-004',
      title: 'Deterministic Behavior',
      category: 'ARCHITECTURE',
      description: 'OS review rules, test isolation methods, and schedule logic must run with determinism. Random functions and state modifications during review are prohibited.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-005',
      title: 'Stateless Review',
      category: 'ARCHITECTURE',
      description: 'Reviews must be stateless. Rules must not accumulate side-effects or persistent memory flags within the same session evaluation.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-006',
      title: 'No Side Effects',
      category: 'SECURITY',
      description: 'Reviews must not execute un-sandboxed operations, un-audited command executions, or external internet fetches without security proxy checks.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-007',
      title: 'Foundation First',
      category: 'GOVERNANCE',
      description: 'Rule self-evolution can only proceed if the rule is backed by verified provenance records, historical false-positive simulation runs, and AI consensus panel checks.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-008',
      title: 'Explainable Decision',
      category: 'QUALITY',
      description: 'Every audit conclusion and consensus decision must output a detailed evaluation trace, a consensus board score, and remediations.',
      severity: 'WARNING',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-009',
      title: 'Governance Before Evolution',
      category: 'GOVERNANCE',
      description: 'Self-evolution triggers must never override core governance filters. Evolution engines operate strictly subordinate to review layers.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-010',
      title: 'Backward Compatibility',
      category: 'ARCHITECTURE',
      description: 'All system upgrades and newly evolved rules must preserve compatibility with active version schemas and core configuration JSON files.',
      severity: 'ERROR',
      version: '1.0.0',
      enabled: true
    },
    {
      id: 'C-011',
      title: 'Centralized Root Resolution',
      category: 'ARCHITECTURE',
      description: 'Project root and platform directories must be resolved exclusively via ProjectRegistry and RootResolver API. Self-discovery is forbidden.',
      severity: 'ERROR',
      version: '1.1.0',
      enabled: true
    },
    {
      id: 'C-012',
      title: 'No Relative Root Discovery',
      category: 'ARCHITECTURE',
      description: 'Directory path traversal jumps or dynamic parent directory calculations in source files or plans are strictly prohibited.',
      severity: 'ERROR',
      version: '1.1.0',
      enabled: true
    }
  ];

  /**
   * Retrieves all enabled constitution articles.
   */
  public static getArticles(): ConstitutionArticle[] {
    return this.articles.filter(a => a.enabled);
  }
}
