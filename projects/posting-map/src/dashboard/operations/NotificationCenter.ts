/**
 * NotificationCenter.ts
 * 
 * ダッシュボード内部でのトースト風運用通知を管理・表示する。
 * 表示最大保持数はメモリ枯渇防止のため 50 件に制限。
 * 外部通信（LINE, メールなど）は一切行わず、ダッシュボード画面内のトースト表示および内部履歴保持を行う。
 */

export type NotificationType =
  | 'Sync Success'
  | 'Sync Failed'
  | 'Retry Started'
  | 'Offline'
  | 'Recovery'
  | 'Cache Cleared'
  | 'Warning';

export interface NotificationItem {
  readonly id: string;
  readonly type: NotificationType;
  readonly message: string;
  readonly timestamp: number;
}

export type NotificationListener = (item: NotificationItem) => void;

export class NotificationCenter {
  private static readonly MAX_NOTIFICATION_HISTORY = 50;
  private history: NotificationItem[] = [];
  private listeners: NotificationListener[] = [];
  private containerElement: HTMLDivElement | null = null;

  constructor() {
    // クライアントブラウザ環境である場合のみ DOM コンテナを作成
    if (typeof document !== 'undefined') {
      this.createContainer();
    }
  }

  /**
   * 通知履歴を取得する
   */
  getHistory(): readonly NotificationItem[] {
    return this.history;
  }

  /**
   * 新しい通知をキューに追加し、トースト表示とイベント発火を実行する
   */
  addNotification(type: NotificationType, message: string): void {
    const item: NotificationItem = {
      id: `NOTIFY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: Date.now()
    };

    // 履歴保持制限の適用 (MAX 50)
    this.history.push(item);
    if (this.history.length > NotificationCenter.MAX_NOTIFICATION_HISTORY) {
      this.history.shift();
    }

    console.log(`[NotificationCenter] [${type}] ${message}`);

    // リスナーへのコールバック
    this.listeners.forEach(listener => {
      try {
        listener(item);
      } catch (err) {
        console.error('[NotificationCenter] Error in event listener callback:', err);
      }
    });

    // UIトーストの描画
    if (typeof document !== 'undefined') {
      this.showToast(item);
    }
  }

  /**
   * 通知イベントを購読する
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * 通知用トーストのCSSデザイン・コンテナを作成
   */
  private createContainer(): void {
    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const existing = document.getElementById('dashboard-notification-container');
      if (existing) {
        this.containerElement = existing as HTMLDivElement;
        return;
      }

      if (document.body && typeof document.body.appendChild === 'function') {
        this.containerElement = document.createElement('div');
        this.containerElement.id = 'dashboard-notification-container';
        
        // 右下に固定配置する glassmorphic な通知スタック領域
        const s = this.containerElement.style;
        s.position = 'fixed';
        s.bottom = '24px';
        s.right = '24px';
        s.display = 'flex';
        s.flexDirection = 'col-reverse';
        s.flexDirection = 'column'; // 上から積み上げる
        s.gap = '8px';
        s.zIndex = '99999';
        s.maxWidth = '360px';
        s.pointerEvents = 'none';

        document.body.appendChild(this.containerElement);
      }
    }
  }

  /**
   * 画面上にフローティングトーストを描画・自動フェードアウト消去
   */
  private showToast(item: NotificationItem): void {
    if (!this.containerElement) {
      this.createContainer();
    }

    if (!this.containerElement || typeof document === 'undefined') {
      return;
    }

    const toast = document.createElement('div');
    toast.className = 'dashboard-toast';
    
    // カラーテーマ設定
    let borderHex = 'rgba(255, 255, 255, 0.08)';
    let badgeColor = '#ffffff';
    let glowColor = 'rgba(37,99,235,0.05)';

    switch (item.type) {
      case 'Sync Success':
      case 'Recovery':
        borderHex = 'rgba(16, 185, 129, 0.3)';
        badgeColor = '#10b981';
        break;
      case 'Sync Failed':
        borderHex = 'rgba(239, 68, 68, 0.3)';
        badgeColor = '#ef4444';
        break;
      case 'Warning':
      case 'Retry Started':
        borderHex = 'rgba(245, 158, 11, 0.3)';
        badgeColor = '#f59e0b';
        break;
      case 'Offline':
        borderHex = 'rgba(107, 114, 128, 0.3)';
        badgeColor = '#6b7280';
        break;
      case 'Cache Cleared':
        borderHex = 'rgba(59, 130, 246, 0.3)';
        badgeColor = '#3b82f6';
        break;
    }

    // 高級デザインシステムに則った Glassmorphic UI 適用
    const s = toast.style;
    s.pointerEvents = 'auto';
    s.padding = '12px 16px';
    s.borderRadius = '16px';
    s.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008))';
    s.boxShadow = `inset 0 0 0 1px ${borderHex}, 0 4px 12px rgba(0,0,0,0.5)`;
    s.backdropFilter = 'blur(20px)';
    s.setProperty('-webkit-backdrop-filter', 'blur(20px)');
    s.color = '#ffffff';
    s.fontFamily = 'Inter, sans-serif';
    s.fontSize = '12px';
    s.lineHeight = '1.4';
    s.display = 'flex';
    s.alignItems = 'flex-start';
    s.gap = '10px';
    s.opacity = '0';
    s.transform = 'translateY(10px)';
    s.transition = 'opacity 250ms cubic-bezier(0.16, 1, 0.3, 1), transform 250ms cubic-bezier(0.16, 1, 0.3, 1)';

    // バッジアイコン
    const badge = document.createElement('span');
    badge.innerText = '●';
    badge.style.color = badgeColor;
    badge.style.fontSize = '10px';
    badge.style.marginTop = '2px';

    // メッセージコンテンツ
    const content = document.createElement('div');
    content.style.flex = '1';
    
    const typeLabel = document.createElement('div');
    typeLabel.innerText = item.type.toUpperCase();
    typeLabel.style.fontWeight = '800';
    typeLabel.style.fontSize = '10px';
    typeLabel.style.letterSpacing = '0.05em';
    typeLabel.style.color = 'rgba(255, 255, 255, 0.4)';
    typeLabel.style.marginBottom = '2px';

    const text = document.createElement('div');
    text.innerText = item.message;
    text.style.fontWeight = '500';

    content.appendChild(typeLabel);
    content.appendChild(text);
    toast.appendChild(badge);
    toast.appendChild(content);

    this.containerElement?.appendChild(toast);

    // アニメーション表示開始
    requestAnimationFrame(() => {
      s.opacity = '1';
      s.transform = 'translateY(0)';
    });

    // 4秒後に自動でフェードアウトして削除
    setTimeout(() => {
      s.opacity = '0';
      s.transform = 'translateY(-10px)';
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    }, 4000);
  }
}
