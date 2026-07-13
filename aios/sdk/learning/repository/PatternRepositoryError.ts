export class PatternRepositoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PatternRepositoryError';
    Object.setPrototypeOf(this, PatternRepositoryError.prototype);
  }
}
