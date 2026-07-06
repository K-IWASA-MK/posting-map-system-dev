/**
 * OS Configuration Layer (Frontend)
 * UIのベースとなる各種環境設定・定数を一元管理します。
 */

const CONFIG = {
  // 稼働中のバックエンドAPIエンドポイント
  API_BASE: "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec",
  
  // LINE LIFF アプリケーションID
  LIFF_ID: "2010374196-gIYb6PDH",

  // デフォルトのテナント情報 (Scope統制)
  DEFAULT_TENANT_ID: "MIE-03",
  DEFAULT_BRANCH_ID: "MIE-03",
  DEFAULT_BRANCH_NAME: "三重第3支部",

  // 論理マップ（必要に応じて拡張）
  MAP: {
    DEFAULT_CENTER: [35.0, 136.0]
  }
};
