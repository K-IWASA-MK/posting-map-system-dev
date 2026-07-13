export class RepositoryProvisioningError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'RepositoryProvisioningError';
  }
}
