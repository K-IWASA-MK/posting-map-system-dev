export class RoutePolicy {
  private static readonly ALLOWED_METHODS: Set<string> = new Set(['GET', 'POST', 'PUT', 'DELETE']);

  public static isMethodAllowed(method: string): boolean {
    return RoutePolicy.ALLOWED_METHODS.has(method.toUpperCase());
  }
}
