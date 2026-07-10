/**
 * DashboardBootstrap.ts
 * 
 * DOMContentLoaded ライフサイクルイベントをフックし、クライアントCONFIGパラメータの
 * マッピングと DashboardApplication の起動シーケンスを立ち上げるブートローダー。
 */

import { DashboardApplication } from './DashboardApplication';

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

  // 2. CONFIG情報の取得（グローバルに定義された config.js 等から読み込み、無ければデフォルト三重第3支部）
  const config = window.CONFIG || {};
  const apiUrl = config.API_BASE || 'https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec';
  const tenantId = config.DEFAULT_TENANT_ID || 'MIE-03';
  const branchId = config.DEFAULT_BRANCH_ID || 'MIE-03';

  // 3. システムの起動開始
  try {
    await DashboardApplication.getInstance().start(root as HTMLElement, apiUrl, tenantId, branchId);
  } catch (err) {
    console.error('[DashboardBootstrap] Application startup failed', err);
  }
});

window.addEventListener('unload', () => {
  console.log('[DashboardBootstrap] Unload received. Cleaning up...');
  DashboardApplication.getInstance().destroy();
});
