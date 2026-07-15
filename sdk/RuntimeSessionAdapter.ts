import { Session } from './RuntimeSessionRegistry';

/**
 * RuntimeSessionAdapter.ts
 * 
 * Session レコードを UI 表示用の Immutable な ViewModel へ変換するアダプター。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export interface SessionViewModel {
  readonly id: string;
  readonly name: string;
  readonly runtimeId: string;
  readonly descriptionText: string;
  readonly sessionSpecVersion: string;
  readonly stateLabel: string;
  readonly createdTimestamp: string;
  readonly updatedTimestamp: string;
}

export class RuntimeSessionAdapter {
  /**
   * Session レコードを不変な SessionViewModel へ変換する
   */
  static toViewModel(session: Session): SessionViewModel {
    if (!session) {
      throw new Error('[RuntimeSessionAdapter] Session cannot be empty');
    }

    const viewModel: SessionViewModel = {
      id: session.sessionId,
      name: session.sessionName,
      runtimeId: session.runtimeId,
      descriptionText: session.description || '',
      sessionSpecVersion: session.sessionVersion,
      stateLabel: String(session.state),
      createdTimestamp: session.createdAt,
      updatedTimestamp: session.updatedAt
    };

    return Object.freeze(viewModel);
  }
}
