import { RepositoryExecutionContext } from './RepositoryExecutionContext';
import { RepositoryResult } from '../../repository/RepositoryResult';

export interface RepositoryProvider {
  execute(context: RepositoryExecutionContext): Promise<RepositoryResult>;
}
