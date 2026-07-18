export interface RuntimeDescriptor {
  readonly runtimeName: string;
  readonly version: string;
  readonly capabilities: readonly string[];
}

export class RuntimeRegistry {
  private readonly runtimes = new Map<string, RuntimeDescriptor>();

  /**
   * Registers a runtime capability descriptor.
   */
  public register(descriptor: RuntimeDescriptor): void {
    this.runtimes.set(descriptor.runtimeName, descriptor);
  }

  /**
   * Resolves registered runtime capability descriptors.
   */
  public get(runtimeName: string): RuntimeDescriptor | undefined {
    return this.runtimes.get(runtimeName);
  }

  /**
   * Checks if a target runtime is registered.
   */
  public has(runtimeName: string): boolean {
    return this.runtimes.has(runtimeName);
  }

  /**
   * Clears the current runtime list.
   */
  public clear(): void {
    this.runtimes.clear();
  }
}
