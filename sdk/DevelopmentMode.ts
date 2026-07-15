/**
 * DevelopmentMode.ts
 * 
 * Development OS の動作状態を定義する不変データモデル。
 * 
 * 警告：本ファイル内への API 通信、コマンド送信、自律改善、AI予測・推論・自動配置ロジックの実装は厳禁である。
 */

export type ModeStatus = 'INACTIVE' | 'READ_ONLY' | 'PLANNING' | 'EXECUTING' | 'TESTING';

export interface DevelopmentModeState {
  readonly developmentModeId: string;
  readonly modeName: string;
  readonly modeStatus: ModeStatus;
  readonly createdAt: string;
}

export class DevelopmentMode {
  /**
   * 不変な開発モード状態オブジェクトを生成する
   */
  static createMode(id: string, name: string, status: ModeStatus): DevelopmentModeState {
    if (!id) {
      throw new Error('[DevelopmentMode] developmentModeId is required');
    }
    if (!name) {
      throw new Error('[DevelopmentMode] modeName is required');
    }

    const state: DevelopmentModeState = {
      developmentModeId: id,
      modeName: name,
      modeStatus: status,
      createdAt: new Date('2026-07-09T09:30:00Z').toISOString() // 決定論的なダンプ時間
    };

    return Object.freeze(state);
  }
}
