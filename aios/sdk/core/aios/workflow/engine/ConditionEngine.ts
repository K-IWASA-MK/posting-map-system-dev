import { WorkflowContext } from '../WorkflowContext';

export class ConditionEngine {
  /**
   * Evaluates a simple condition string against the workflow context.
   * For the foundation, we support simple variable checks like "qualityGate == PASS"
   * or "outputs.build == SUCCESS".
   */
  public evaluate(condition: string, context: WorkflowContext): boolean {
    if (!condition) {
      return true;
    }

    try {
      // Basic expression evaluation (Foundation phase: simple equality)
      // e.g. "variables.branch == main"
      const parts = condition.split('==').map(p => p.trim());
      if (parts.length === 2) {
        const [left, right] = parts;
        const leftValue = this.resolveValue(left, context);
        const rightValue = right.replace(/^['"](.*)['"]$/, '$1'); // remove quotes
        return leftValue === rightValue;
      }
      
      // Fallback: if not parsed, assume it's truthy if it exists in context
      return !!this.resolveValue(condition, context);
    } catch (error) {
      console.warn(`ConditionEngine failed to evaluate: ${condition}`, error);
      return false;
    }
  }

  private resolveValue(path: string, context: WorkflowContext): unknown {
    const keys = path.split('.');
    let current: any = context;
    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[key];
    }
    return current;
  }
}
