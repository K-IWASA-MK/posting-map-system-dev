export class RouteKey {
  private readonly key: string;

  constructor(method: string, version: string, path: string) {
    // パスから末尾・先頭のスラッシュ等を正規化 (例: "dashboard" -> "/dashboard")
    let normalizedPath = path.trim().toLowerCase();
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    if (normalizedPath.endsWith('/') && normalizedPath.length > 1) {
      normalizedPath = normalizedPath.slice(0, -1);
    }

    this.key = `${method.toUpperCase()}:${version.toLowerCase()}:${normalizedPath}`;
  }

  public toString(): string {
    return this.key;
  }
}

export class RouteResolver {
  public static resolveKey(method: string, version: string, path: string): string {
    return new RouteKey(method, version, path).toString();
  }
}
