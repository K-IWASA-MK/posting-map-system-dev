import { Context } from './RuntimeContextRegistry';

/**
 * RuntimeContextAdapter.ts
 * 
 * Context レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface ContextViewModel {
  readonly id: string;
  readonly name: string;
  readonly sessionId: string;
  readonly descriptionText: string;
  readonly contextSpecVersion: string;
  readonly stateLabel: string;
  readonly displayName: string;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeContextAdapter {
  /**
   * Context レコードを不変な ContextViewModel へ変換する
   */
  static toViewModel(context: Context): ContextViewModel {
    if (!context) {
      throw new Error('[RuntimeContextAdapter] Context cannot be empty');
    }

    const viewModel: ContextViewModel = {
      id: context.contextId,
      name: context.contextName,
      sessionId: context.sessionId,
      descriptionText: context.description || '',
      contextSpecVersion: context.contextVersion,
      stateLabel: String(context.state),
      displayName: `Context: ${context.contextName} (${context.contextId})`,
      createdTimestamp: context.createdAt,
      updatedTimestamp: context.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
