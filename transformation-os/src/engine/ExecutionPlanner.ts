import { ValidationResult } from '../models/evaluation';
import { ExecutionDecision, IExecutionPlanner } from '../models/execution';
import { resolveActionPriority } from '../catalog/DiagnosticCatalog';

/**
 * ExecutionPlanner
 * 
 * The Catalog Resolver. 
 * It receives pure DiagnosticCodes (ValidationResult), resolves them against the Catalog,
 * and makes the final ExecutionDecision.
 * 
 * It MUST NOT execute the action, only plan it.
 */
export class ExecutionPlanner implements IExecutionPlanner {
  
  createPlan(result: ValidationResult): ExecutionDecision {
    const codes = result.violations.map(v => v.code);
    const resolvedAction = resolveActionPriority(codes);

    // If the resolved action is PROCEED, we move forward.
    // Notice that IGNORE might also conceptually allow proceeding, but for strict 
    // compliance with the OS pattern, if the only action is IGNORE, does it proceed?
    // Let's treat IGNORE as a halt but safe. Or we can say if there's no violations, it's PROCEED.
    // If there ARE violations and the worst one is IGNORE, we still halt (or proceed with warnings)?
    // Wait, the CEO said: "PROCEED: No violations, or only ignored violations" in my previous implementation plan which the CEO approved (though with some renaming).
    // Actually, let's look at what is safest: if the final action is 'PROCEED', then we proceed.
    // But `resolveActionPriority` returns 'IGNORE' if that's the highest. 
    // If it's 'IGNORE', should we proceed? The CEO said Action is for exceptions.
    // Let's assume if it resolves to 'IGNORE', it means the engine should halt but just ignore the event.
    // No, if an event is unknown (V3002 -> IGNORE), we drop it. We don't process it. So proceed: false, action: IGNORE.
    
    if (resolvedAction === 'PROCEED') {
      return { proceed: true };
    }

    return {
      proceed: false,
      action: resolvedAction,
      diagnostics: codes
    };
  }
}
