import { GasConfigurationProvider } from '../gas/GasConfigurationProvider';

export class ApiVersionResolver {
  private static readonly SUPPORTED_VERSIONS: Set<string> = new Set(['v1', 'v2', 'v3', 'future']);

  public static resolve(pathVersion?: string, queryVersion?: string): string {
    // 優先度 1: パスで指定されたバージョン (例: /v2/dashboard)
    if (pathVersion && ApiVersionResolver.SUPPORTED_VERSIONS.has(pathVersion.toLowerCase())) {
      return pathVersion.toLowerCase();
    }

    // 優先度 2: クエリ/ボディパラメータで指定されたバージョン (例: ?version=2)
    if (queryVersion) {
      const normalized = queryVersion.startsWith('v') ? queryVersion.toLowerCase() : `v${queryVersion}`;
      if (ApiVersionResolver.SUPPORTED_VERSIONS.has(normalized)) {
        return normalized;
      }
    }

    // デフォルト: GasConfigurationProvider の API バージョン
    const defaultVersion = GasConfigurationProvider.getInstance().getApiVersion();
    const resolvedDefault = defaultVersion.split('-')[0].split('.')[0]; // 例: "1.0.0-RC1" -> "v1"
    const finalDefault = resolvedDefault.startsWith('v') ? resolvedDefault.toLowerCase() : `v${resolvedDefault}`;
    return ApiVersionResolver.SUPPORTED_VERSIONS.has(finalDefault) ? finalDefault : 'v2';
  }
}
