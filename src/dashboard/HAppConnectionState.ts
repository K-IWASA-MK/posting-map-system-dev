/**
 * HAppConnectionState.ts
 * 
 * H-App とダッシュボード間のデータ同期における接続状態（Connection State）を
 * 集中管理する状態ホルダー。
 */

export type ConnectionState = 'CONNECTED' | 'SYNCING' | 'OFFLINE' | 'ERROR';

export class HAppConnectionState {
  private state: ConnectionState = 'CONNECTED';
  private listeners: ((state: ConnectionState) => void)[] = [];

  /**
   * 現在の接続状態を取得
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * 接続状態を変更し、リスナーへ通知する
   */
  setState(newState: ConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      console.log(`[HAppConnectionState] Connection status transition: ${oldState} -> ${newState}`);
      this.listeners.forEach(listener => listener(newState));
    }
  }

  /**
   * 接続状態の変更イベントを購読する
   */
  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * リセット処理（テスト用）
   */
  reset(): void {
    this.state = 'CONNECTED';
    this.listeners = [];
  }
}
