/**
 * Phase 2-B: Production Shadow Deploy
 * EventLog 書き込み専用モジュール
 */

function appendEventLog(event) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (e) {
    throw new Error("サーバーが混雑しています。時間をおいて再度お試しください。");
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.get("SHEETS.EVENTLOG"));
    
    // シートが存在しない場合は自動生成
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.get("SHEETS.EVENTLOG"));
      sheet.appendRow([
        "id", "timestamp", "tenantId", "branchId", "prefectureId", 
        "blockId", "userId", "actionType", "count", "lat", "lng", "meta"
      ]);
      sheet.getRange("A1:L1").setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }

    const row = [
      event.id,
      event.timestamp,
      event.tenantId || "DEFAULT_TENANT",
      event.branchId || "DEFAULT_BRANCH",
      event.prefectureId || "MIE",
      event.blockId,
      event.userId || "UNKNOWN",
      event.actionType,
      event.count || 0,
      event.lat || 0,
      event.lng || 0,
      JSON.stringify(event.meta || {})
    ];

    sheet.appendRow(row);
    
    // キャッシュをフラッシュ
    CacheService.getScriptCache().remove("EVENT_LOGS_V2");
    
    // Phase 16: リアルタイム戦略OSキャッシュ無効化
    if (typeof onNewEventLogEntry === "function") {
      onNewEventLogEntry(event.branchId || "DEFAULT_BRANCH");
    }
  } finally {
    lock.releaseLock();
  }
}
