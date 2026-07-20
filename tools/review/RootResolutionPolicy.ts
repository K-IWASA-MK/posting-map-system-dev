export class RootResolutionPolicy {
  /**
   * Evaluates if a given code content or plan description violates the path resolution policies.
   */
  public static isPolicyViolated(content: string): { violated: boolean; reason: string } {
    // Count occurrences of '..' or ".."
    const dotDotOccurrences = (content.match(/\.\./g) || []).length;

    // 1. Check for 4+ levels of relative traversal, e.g. '../../../../' or '..' repeated 4 times
    const hasRelativeTraversal = /(\.\.[\/\\]){4,}/.test(content) || dotDotOccurrences >= 4;
    if (hasRelativeTraversal) {
      return {
        violated: true,
        reason: 'Violation ROOT-001 (Relative Root Traversal): Relative path directory jumps of 4 or more levels detected. Use RootResolver instead.'
      };
    }

    // 2. Check for __dirname combined with multiple directory jumps
    const hasDirnameJumps = content.includes('__dirname') && (content.includes('..') && dotDotOccurrences >= 2);
    if (hasDirnameJumps) {
      return {
        violated: true,
        reason: 'Violation ROOT-001 (Relative Root Traversal): Dynamic directory exploration using __dirname and relative jumps detected. Use RootResolver to acquire paths determinants.'
      };
    }

    return { violated: false, reason: '' };
  }
}
