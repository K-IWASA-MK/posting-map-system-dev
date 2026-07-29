import { RepositoryUpdateRequest } from '../../../src/application/task-result';

export class SpreadsheetSheetResolver {
  public resolveSheetName(request: RepositoryUpdateRequest): string {
    // Determine sheet name purely based on request metadata or rules, without business logic.
    // E.g. Using a default "Tasks" sheet, or mapping from a domain identifier.
    const metadata = request.metadata as any;
    if (metadata && metadata.targetSheet) {
      return metadata.targetSheet;
    }
    
    // Default sheet fallback
    return 'Tasks';
  }
}
