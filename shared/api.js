/**
 * POSTING MAP — 共通 GAS API クライアント
 *
 * 配布員アプリ（field/）と管理者アプリ（admin/）の両方が使用する共通モジュール。
 *
 * 提供する関数:
 *   callApi(action, params)    — GETリクエスト（データ取得用）
 *   callApiPost(action, payload) — POSTリクエスト（データ書き込み・写真送信用）
 *
 * 特徴:
 *   - GASコールドスタート対策: 最大3回リトライ + 指数バックオフ
 *   - iOS WebKit 302キャッシュ回避: _t パラメータ付与
 *   - CORSプリフライト回避: POSTはContent-Type未指定（text/plain扱い）
 *   - タイムアウト: GET=20秒, POST=90秒（写真アップロード対応）
 *   - alert()は使用しない（配布員の操作を止めないため）
 */

// ── GAS Web App エンドポイント ────────────────────────────────────
// 開発環境（dev ブランチ / K-IWASA-MK/posting-map-system-dev）用
const API_URL = "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";

// ── 内部ログ出力（logDebug が未定義の場合は console.log を使用）──────
function _apiLog(msg) {
  if (typeof window.logDebug === 'function') {
    window.logDebug(msg);
  } else {
    console.log('[API]', msg);
  }
}

/**
 * GETリクエスト — データ取得用
 *
 * @param {string} action - GAS doGet の action パラメータ
 * @param {Object} params - 追加クエリパラメータ（省略可）
 * @returns {Promise<Object>} GASからのJSONレスポンス
 * @throws {Error} 最大リトライ後も失敗した場合
 */
async function callApi(action, params = {}) {
  const MAX_RETRIES = 3;
  let delay = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const queryParams = new URLSearchParams({
      action: action,
      _t: Date.now().toString(), // キャッシュバスター：iOS WebKit の302キャッシュ回避
      ...params
    });

    const url = `${API_URL}?${queryParams.toString()}`;

    try {
      _apiLog(`[callApi] START (Attempt ${attempt}/${MAX_RETRIES}): action=${action}`);

      // 20秒タイムアウト（GASコールドスタート対策）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      _apiLog(`[callApi] FETCH OK. status=${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const text = await response.text();
      _apiLog(`[callApi] TEXT RECEIVED (length=${text.length})`);
      _apiLog(`[callApi] TEXT PREVIEW: ${text.substring(0, 150)}`);

      let data;
      try {
        data = JSON.parse(text);
        _apiLog(`[callApi] JSON PARSE SUCCESS. success=${data.success}`);
      } catch (parseErr) {
        throw new Error('JSON形式ではない応答を受け取りました: ' + parseErr.message);
      }

      if (data.success === false) {
        throw new Error(data.message || 'API Error');
      }
      return data;

    } catch (err) {
      _apiLog(`[callApi] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        _apiLog('[callApi] ALL ATTEMPTS FAILED.');
        console.error('API Connection Error:', err);
        // alert()は使用しない — IndexedDBキューが自動リトライするため操作を止めない
        throw err;
      }
      _apiLog(`[callApi] Waiting ${delay}ms before retry...`);
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

/**
 * POSTリクエスト — データ書き込み・写真アップロード用
 *
 * Content-Type未指定（text/plain扱い）でCORSプリフライトを回避しながら
 * JSONボディを送信する。
 *
 * @param {string} action  - GAS doPost の action フィールド
 * @param {Object} payload - 送信するJSONオブジェクト（省略可）
 * @returns {Promise<Object>} GASからのJSONレスポンス
 * @throws {Error} 最大リトライ後も失敗した場合
 */
async function callApiPost(action, payload = {}) {
  const MAX_RETRIES = 3;
  let delay = 1000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const url = `${API_URL}?_t=${Date.now()}`; // action はボディに含める
    const body = JSON.stringify({ action, ...payload });

    try {
      _apiLog(`[callApiPost] START (Attempt ${attempt}/${MAX_RETRIES}): action=${action}, bodySize=${body.length}`);

      // 90秒タイムアウト（大容量画像POST + GASコールドスタート + Driveドライブ保存対策）
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'follow',
        // Content-Typeを設定しない → text/plain扱い → CORSプリフライト不要
        body,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      _apiLog(`[callApiPost] FETCH OK. status=${response.status}`);

      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const text = await response.text();
      _apiLog(`[callApiPost] TEXT RECEIVED (length=${text.length})`);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('JSON形式ではない応答を受け取りました: ' + parseErr.message);
      }

      if (data.success === false) throw new Error(data.message || 'API Error');
      return data;

    } catch (err) {
      _apiLog(`[callApiPost] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === MAX_RETRIES) {
        console.error('API POST Error:', err);
        throw err;
      }
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}
