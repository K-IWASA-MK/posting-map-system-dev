const DB_NAME = 'PostingMapDB';
const STORE_NAME = 'syncQueue';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
  return dbPromise;
}

// キューにタスクを追加
async function enqueueSync(item) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({
      ...item,
      status: 'pending',
      timestamp: Date.now()
    });
    request.onsuccess = () => {
      resolve(request.result);
      // 即座に同期を試みる
      processQueue();
    };
    request.onerror = (e) => reject(e.target.error);
  });
}

// 全キューを取得
async function getQueue() {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

// 特定のrowIdの送信中/待機中のステータスを取得
async function getRowStatus(rowId) {
  const queue = await getQueue();
  const found = queue.find(q => q.rowId === rowId);
  return found ? found.status : null; // 'pending' | 'sending' | 'failed'
}

// 特定のキューを削除
async function dequeueSync(id) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (e) => reject(e.target.error);
  });
}

// 特定のキューのステータスを更新
async function updateQueueStatus(id, status) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const data = getReq.result;
      if (data) {
        data.status = status;
        store.put(data);
      }
      resolve();
    };
    getReq.onerror = (e) => reject(e.target.error);
  });
}

// 同期中フラグ
let isProcessing = false;

// キューの同期実行
async function processQueue() {
  if (isProcessing) return;
  if (!navigator.onLine) {
    updateUISyncStatus();
    return;
  }

  isProcessing = true;
  updateUISyncStatus();

  try {
    const queue = await getQueue();
    // pending または failed のものを抽出
    const pendingItems = queue.filter(item => item.status === 'pending' || item.status === 'failed');

    for (const item of pendingItems) {
      await updateQueueStatus(item.id, 'sending');
      updateUISyncStatus();

      try {
        let photoData = '';
        if (item.imageBlob) {
          photoData = await blobToBase64(item.imageBlob);
        }

        const payload = {
          areaName: item.areaName,
          rowId: item.rowId,
          isDone: item.isDone,
          count: item.count,
          latitude: item.latitude || '',
          longitude: item.longitude || '',
          photoData: photoData,
          staffName: item.staffName,
          staffId: item.staffId
        };

        // 写真データはURL長制限を超えるためPOSTで送信
        const res = await callApiPost('updateRecordWithGPSPhoto', payload);
        if (res && res.success) {
          await dequeueSync(item.id);
          
          // メモリ上のローカルキャッシュ(allPoints)を同期
          if (typeof allPoints !== 'undefined' && allPoints) {
            const p = allPoints.find(point => point.rowId === item.rowId); // let変数は window に付かないため直接参照
            if (p) {
              // GASから返却されるのはfileId（非公開）なのでphotoUrlとして保持
              p.photoUrl = res.photoUrl || '';
              // ローカルBlobプレビューは送信完了後にクリア
              delete p.tempPhotoUrl;
              // UI再描画: リスト全体と、開いている詳細モーダルを更新
              if (typeof renderDetailList === 'function') {
                renderDetailList(item.areaName);
              }
              if (window.currentPointDetailRowId === item.rowId) {
                const modalContent = document.getElementById('detail-modal-content');
                if (modalContent && typeof renderDetailModalContent === 'function') {
                  modalContent.innerHTML = renderDetailModalContent(p);
                }
              }
            }
          }
        } else {
          throw new Error(res ? res.message : 'API failure');
        }
      } catch (err) {
        console.error('Failed to sync item:', item.id, err);
        await updateQueueStatus(item.id, 'failed');
      }
    }
  } catch (err) {
    console.error('Queue processing error:', err);
  } finally {
    isProcessing = false;
    updateUISyncStatus();
  }
}

// Blob to Base64
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function updateUISyncStatus() {
  if (typeof window.triggerUISyncRefresh === 'function') {
    window.triggerUISyncRefresh();
  }
}

// オンライン復帰時に自動同期
window.addEventListener('online', () => {
  console.log('App is online. Processing sync queue...');
  processQueue();
});

// 定期リトライ (30秒ごと)
setInterval(() => {
  if (navigator.onLine) {
    processQueue();
  }
}, 30000);
