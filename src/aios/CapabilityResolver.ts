/**
 * CapabilityResolver.ts
 * 
 * 開発作業内容（タスクの目的）から必要な抽象 Capability を静的に解決するモジュール。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

import { Capability, CapabilityRegistry, CapabilityCategory } from './CapabilityRegistry';

export class CapabilityResolver {
  /**
   * タスク概要もしくはファイルパス情報から必要な抽象 Capability を解決し、Registry から取得する。
   */
  static resolve(taskDescription: string, targetPath?: string): Capability {
    if (!taskDescription) {
      throw new Error('[CapabilityResolver] taskDescription is required');
    }

    const descLower = taskDescription.toLowerCase();
    const pathLower = targetPath ? targetPath.toLowerCase() : '';
    let category: CapabilityCategory = CapabilityCategory.Implementation;

    // 1. Architecture: 設計や基本憲章に関わるもの
    if (descLower.includes('charter') || descLower.includes('architecture') || descLower.includes('design rule')) {
      category = CapabilityCategory.Architecture;
    }
    // 2. Planning: 計画やロードマップの策定
    else if (descLower.includes('plan') || descLower.includes('roadmap') || descLower.includes('schedule')) {
      category = CapabilityCategory.Planning;
    }
    // 3. Testing: テスト実行やアサーション作成
    else if (descLower.includes('test') || descLower.includes('pytest') || pathLower.startsWith('tests/')) {
      category = CapabilityCategory.Testing;
    }
    // 4. Review: 監査や静的検証
    else if (descLower.includes('review') || descLower.includes('audit') || descLower.includes('quality gate')) {
      category = CapabilityCategory.Review;
    }
    // 5. Debugging: バグ修正やログ調査
    else if (descLower.includes('fix') || descLower.includes('bug') || descLower.includes('debug')) {
      category = CapabilityCategory.Debugging;
    }
    // 6. Documentation: ドキュメント作成
    else if (descLower.includes('doc') || pathLower.endsWith('.md') || pathLower.endsWith('.txt')) {
      category = CapabilityCategory.Documentation;
    }
    // 7. Release: リリースやタグ付与
    else if (descLower.includes('release') || descLower.includes('tag') || descLower.includes('publish')) {
      category = CapabilityCategory.Release;
    }

    // Registryから解決された名前で Capability オブジェクトを解決
    const cap = CapabilityRegistry.getByName(category);
    if (!cap) {
      throw new Error(`[CapabilityResolver] Resolved capability category '${category}' is not registered in registry.`);
    }

    return cap;
  }
}
