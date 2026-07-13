export class EvolutionTargetRegistry {
  private targets: Set<string> = new Set();

  register(targetComponent: string): void {
    this.targets.add(targetComponent);
  }

  isRegistered(targetComponent: string): boolean {
    return this.targets.has(targetComponent);
  }
}
