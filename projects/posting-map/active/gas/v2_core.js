/**
 * GAS v2 - Core Aggregation Engine (Single Source of Truth)
 * 
 * すべての実績データは EventLog から取得・集計される。
 * UI層での計算を排除し、すべてここで完結させる。
 * (Phase 13 Step 1)
 */

function getEventLogSheet() {
  const ss = getSS();
  return ss.getSheetByName(CONFIG.get("SHEETS.EVENTLOG"));
}

/**
 * EventLogの全データを取得し、キャッシュする
 */
function getAllEventLogs() {
  const cache = CacheService.getScriptCache();
  const CACHE_KEY = "EVENT_LOGS_V2_MIN";
  
  const cached = cache.get(CACHE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }
  
  const sheet = getEventLogSheet();
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  // 必要な集計用データ（id, timestamp, blockId, userId, actionType, count）だけを抽出しサイズを極小化
  const data = sheet.getRange(2, 1, lastRow - 1, 12).getValues();
  const logs = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    logs.push({
      id: String(row[0]),
      timestamp: Number(row[1]),
      blockId: String(row[5]),
      userId: String(row[6]),
      actionType: String(row[7]),
      count: Number(row[8])
    });
  }
  
  try {
    // キャッシュを300秒(5分)維持してシート読み込み遅延を劇的に排除
    cache.put(CACHE_KEY, JSON.stringify(logs), 300);
  } catch(e) {
    Logger.log("Failed to cache event logs: " + e.toString());
  }
  
  return logs;
}


// ==========================================
// 集計エンジン (Aggregation Engine)
// UI層の計算を完全に排除するための集計メソッド群
// ==========================================

/**
 * ブロック（エリア）ごとの集計
 */
function aggregateByBlock(tenantId, branchId) {
  const logs = getAllEventLogs();
  const blockStats = {};
  
  logs.forEach(log => {
    // フィルター条件
    if (tenantId && log.tenantId !== tenantId) return;
    if (branchId && log.branchId !== branchId) return;
    if (log.actionType !== "distribute") return;
    
    if (!blockStats[log.blockId]) {
      blockStats[log.blockId] = {
        name: log.blockId,
        done: 0,
        total: 0, // ※マスタや別のキャッシュから統合予定
        lat: log.lat || null,
        lng: log.lng || null,
        lastUpdated: 0
      };
    }
    
    blockStats[log.blockId].done += 1; // 完了アクションのカウント
    if (log.timestamp > blockStats[log.blockId].lastUpdated) {
      blockStats[log.blockId].lastUpdated = log.timestamp;
      if (log.lat && log.lng) {
        blockStats[log.blockId].lat = log.lat;
        blockStats[log.blockId].lng = log.lng;
      }
    }
  });
  
  return Object.values(blockStats);
}

/**
 * 個人別配布枚数ランキング
 */
function getRankingDataCore() {
  const logs = getAllEventLogs();
  const staffRanking = {};
  
  logs.forEach(log => {
    if (log.actionType !== "distribute") return;
    const staffName = log.meta && log.meta.staffName ? log.meta.staffName : log.userId;
    if (!staffName || staffName === "UNKNOWN") return;
    
    if (!staffRanking[staffName]) {
      staffRanking[staffName] = 0;
    }
    staffRanking[staffName] += log.count;
  });
  
  const rankingList = Object.entries(staffRanking)
    .map(([name, count]) => ({ name: name, count: count }))
    .sort((a, b) => b.count - a.count);
    
  return rankingList;
}

/**
 * 配送証跡統計
 */
function getDeliveryStatsCore() {
  const logs = getAllEventLogs();
  
  let totalCompleted = 0;
  let withGPS = 0;
  let withPhoto = 0;
  let lastSyncAt = 0;
  let activeStaffs = {};
  
  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  
  logs.forEach(log => {
    if (log.actionType !== "distribute") return;
    
    totalCompleted++;
    if (log.lat && log.lng) withGPS++;
    if (log.meta && log.meta.photoUrl) withPhoto++;
    if (log.timestamp > lastSyncAt) lastSyncAt = log.timestamp;
    
    if (log.timestamp >= todayStart.getTime()) {
      activeStaffs[log.userId] = true;
    }
  });
  
  const lastSyncStr = lastSyncAt > 0 ? Utilities.formatDate(new Date(lastSyncAt), "JST", "MM/dd HH:mm") : "";
  
  return {
    success: true,
    totalCompleted: totalCompleted,
    withGPS: withGPS,
    withPhoto: withPhoto,
    pending: totalCompleted - withGPS,
    lastSyncAt: lastSyncStr,
    activeStaffCount: Object.keys(activeStaffs).length
  };
}
