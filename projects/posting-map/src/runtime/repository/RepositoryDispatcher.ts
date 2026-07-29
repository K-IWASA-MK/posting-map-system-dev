import { RepositoryProvider } from './RepositoryProvider';
import { RepositoryProviderType } from './RepositoryProviderType';
import { RepositoryExecutionContext } from './RepositoryExecutionContext';
import { RepositoryResult } from '../../repository/RepositoryResult';

export class RepositoryDispatcher {
  // Registry map, configured only at initialization
  private readonly registry: ReadonlyMap<RepositoryProviderType, RepositoryProvider>;

  constructor(providers: Map<RepositoryProviderType, RepositoryProvider>) {
    // Make the map immutable so providers cannot be dynamically swapped at runtime
    this.registry = new Map(providers);
  }

  public async dispatch(providerType: RepositoryProviderType, context: RepositoryExecutionContext): Promise<RepositoryResult> {
    const provider = this.registry.get(providerType);
    
    if (!provider) {
      throw new Error(`No RepositoryProvider registered for type: ${providerType}`);
    }

    return provider.execute(context);
  }
}
