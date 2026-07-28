/**
 * ProductionAssetExtractor.ts
 * 
 * 本番 HTML / JS 内のコミットハッシュ・アセットバージョン自動抽出ユーティリティ
 */

export interface ExtractedAssetMetadata {
  readonly commitHash?: string;
  readonly version?: string;
  readonly buildTimestamp?: string;
  readonly rawMatches: readonly string[];
}

export class ProductionAssetExtractor {
  /**
   * HTML / JS レスポンス本文からメタデータ・バージョン・コミットハッシュを解析・抽出し照合する
   */
  static extractMetadata(htmlOrJsContent: string): ExtractedAssetMetadata {
    const rawMatches: string[] = [];

    // 1. Check <meta name="version" content="..."> or <meta name="git-commit" content="...">
    const metaCommitMatch = htmlOrJsContent.match(/<meta\s+name=["'](?:version|git-commit|commit)["']\s+content=["']([^"']+)["']/i);
    let commitHash: string | undefined = metaCommitMatch ? metaCommitMatch[1].trim() : undefined;

    // 2. Check window.__BUILD_INFO__ = { commit: "..." } or window.BUILD_COMMIT = "..."
    const buildInfoMatch = htmlOrJsContent.match(/(?:window\.__BUILD_INFO__|BUILD_INFO)\s*=\s*\{[^}]*commit\s*:\s*["']([^"']+)["']/i)
      || htmlOrJsContent.match(/BUILD_COMMIT\s*=\s*["']([^"']+)["']/i);
    if (!commitHash && buildInfoMatch) {
      commitHash = buildInfoMatch[1].trim();
    }

    // 3. Direct SHA-1 / SHA-256 pattern or hex string matches
    const hexMatch = htmlOrJsContent.match(/(?:[a-f0-9]{40}|[a-f0-9]{7,12})/gi);
    if (hexMatch) {
      rawMatches.push(...hexMatch);
    }

    // 4. Version tag match (e.g. v1.2.3 or 5.0.0-alpha.0)
    const versionMatch = htmlOrJsContent.match(/["']?version["']?\s*[:=]\s*["']([^"']+)["']/i);
    const version = versionMatch ? versionMatch[1].trim() : undefined;

    return Object.freeze({
      commitHash,
      version,
      rawMatches: Object.freeze(rawMatches)
    });
  }

  /**
   * 期待される Git コミットハッシュが抽出結果またはコンテンツ内に一致・存在するかを照合する
   */
  static verifyCommitMatch(htmlOrJsContent: string, expectedCommit: string): boolean {
    if (!expectedCommit || expectedCommit.trim() === '') {
      return false;
    }

    const shortCommit = expectedCommit.substring(0, 7).toLowerCase();
    const fullCommit = expectedCommit.toLowerCase();
    const contentLower = htmlOrJsContent.toLowerCase();

    if (contentLower.includes(fullCommit) || contentLower.includes(shortCommit)) {
      return true;
    }

    const extracted = this.extractMetadata(htmlOrJsContent);
    if (extracted.commitHash) {
      const extractedLower = extracted.commitHash.toLowerCase();
      if (extractedLower.includes(shortCommit) || shortCommit.includes(extractedLower)) {
        return true;
      }
    }

    return false;
  }
}
