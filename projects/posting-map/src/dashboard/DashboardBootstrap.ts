/**
 * DashboardBootstrap.ts
 * 
 * DOMContentLoaded ライフサイクルイベントをフックし、クライアントCONFIGパラメータの
 * マッピングと DashboardApplication の起動シーケンスを立ち上げるブートローダー。
 */

import { DashboardApplication } from './DashboardApplication';
import { ProductRuntimeValidator } from './ProductRuntimeValidator';

declare global {
  interface Window {
    CONFIG?: {
      API_BASE?: string;
      DEFAULT_TENANT_ID?: string;
      DEFAULT_BRANCH_ID?: string;
    };
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  console.log('[DashboardBootstrap] DOMContentLoaded received. Starting setup...');
  
  // 1. マウント先ルート要素の取得
  const root = document.getElementById('app') || document.body;

  // 2. CONFIG情報の取得
  const config = window.CONFIG || {};
  const apiUrl = config.API_BASE || 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
  const tenantId = config.DEFAULT_TENANT_ID || 'MIE-03';
  const branchId = config.DEFAULT_BRANCH_ID || 'MIE-03';

  // 3. Runtime Verification (Configuration -> Feature Toggle -> Runtime Validator)
  const validation = ProductRuntimeValidator.validate(apiUrl, tenantId, branchId, 'app');
  if (!validation.success) {
    console.error('[DashboardBootstrap] Runtime validation failed:', validation.errors);
    showErrorOverlay(root as HTMLElement, validation.errors);
    return;
  }

  // 4. システムの起動開始
  try {
    (window as any).DashboardApplication = DashboardApplication;
    await DashboardApplication.getInstance().start(root as HTMLElement, apiUrl, tenantId, branchId);
  } catch (err) {
    console.error('[DashboardBootstrap] Application startup failed', err);
  }
});

window.addEventListener('unload', () => {
  console.log('[DashboardBootstrap] Unload received. Cleaning up...');
  DashboardApplication.getInstance().destroy();
});

/**
 * 起動エラー時に表示する高精細ブラック警告オーバーレイ
 */
function showErrorOverlay(container: HTMLElement, errors: string[]) {
  container.innerHTML = '';
  const overlay = document.createElement('div');
  
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = '#000000';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '99999';
  overlay.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  overlay.style.color = '#ffffff';
  overlay.style.padding = '24px';
  
  const card = document.createElement('div');
  card.style.borderRadius = '28px';
  card.style.background = 'linear-gradient(180deg, rgba(255, 50, 50, 0.04), rgba(255, 0, 0, 0.01))';
  card.style.boxShadow = 'inset 0 0 0 1px rgba(255, 80, 80, 0.15), 0 0 50px rgba(255, 0, 0, 0.1)';
  card.style.backdropFilter = 'blur(30px)';
  card.style.setProperty('-webkit-backdrop-filter', 'blur(30px)');
  card.style.padding = '40px';
  card.style.maxWidth = '500px';
  card.style.width = '100%';
  
  const title = document.createElement('h2');
  title.innerText = 'PRODUCT RUNTIME VALIDATION FAILURE';
  title.style.margin = '0 0 16px 0';
  title.style.fontSize = '18px';
  title.style.letterSpacing = '0.08em';
  title.style.color = '#ef4444';
  title.style.fontWeight = '800';
  
  const desc = document.createElement('p');
  desc.innerText = '製品の安全な起動のためのシステム要件または機能整合性検証に失敗しました。以下のエラーを修正してください：';
  desc.style.fontSize = '13px';
  desc.style.color = 'rgba(255,255,255,0.7)';
  desc.style.lineHeight = '1.6';
  desc.style.marginBottom = '20px';
  
  const list = document.createElement('ul');
  list.style.fontSize = '12px';
  list.style.color = '#fca5a5';
  list.style.lineHeight = '1.7';
  list.style.paddingLeft = '20px';
  
  errors.forEach(err => {
    const li = document.createElement('li');
    li.innerText = err;
    list.appendChild(li);
  });
  
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(list);
  overlay.appendChild(card);
  container.appendChild(overlay);
}
