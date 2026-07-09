/**
 * CapabilityResolver.ts
 * 
 * 開発作業内容（タスクの目的）から必要な抽象 Capability を静的に解決するモジュール。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export type CapabilityType =
  | 'Architecture'
  | 'Planning'
  | 'Implementation'
  | 'Testing'
  | 'Review'
  | 'Debugging'
  | 'Documentation'
  | 'Release';

export class CapabilityResolver {
  /**
   * タスク概要もしくはファイルパス情報から必要な抽象 Capability を解決する。
   * 実際の実行権限や実行処理自体は本フェーズでは含まない。
   */
  static resolve(taskDescription: string, targetPath?: string): CapabilityType {
    if (!taskDescription) {
      throw new Error('[CapabilityResolver] taskDescription is required');
    }

    const descLower = taskDescription.toLowerCase();
    const pathLower = targetPath ? targetPath.toLowerCase() : '';

    // 1. Architecture: 設計や基本憲章に関わるもの
    if (descLower.includes('charter') || descLower.includes('architecture') || descLower.includes('design rule')) {
      return 'Architecture';
    }

    // 2. Planning: 計画やロードマップの策定
    if (descLower.includes('plan') || descLower.includes('roadmap') || descLower.includes('schedule')) {
      return 'Planning';
    }

    // 3. Testing: テスト実行やアサーション作成
    if (descLower.includes('test') || descLower.includes('pytest') || pathLower.startsWith('tests/')) {
      return 'Testing';
    }

    // 4. Review: 監査や静的検証
    if (descLower.includes('review') || descLower.includes('audit') || descLower.includes('quality gate')) {
      return 'Review';
    }

    // 5. Debugging: バグ修正やログ調査
    if (descLower.includes('fix') || descLower.includes('bug') || descLower.includes('debug')) {
      return 'Debugging';
    }

    // 6. Documentation: ドキュメント作成
    if (descLower.includes('doc') || pathLower.endsWith('.md') || pathLower.endsWith('.txt')) {
      return 'Documentation';
    }

    // 7. Release: リリースやタグ付与
    if (descLower.includes('release') || descLower.includes('tag') || descLower.includes('publish')) {
      return 'Release';
    }

    // デフォルトは Implementation（実装）とする
    return 'Implementation';
  }
}
