/**
 * POSTING MAP H-app IndexedDB & Offline Storage Module
 * Restored from active_backup/mobile/db.js
 */
(function(window) {
  const DB_NAME = 'PostingMapHAppDB';
  const DB_VERSION = 1;
  const STORE_DRAFTS = 'drafts';
  const STORE_QUEUE = 'syncQueue';

  let dbPromise = null;

  function initDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        console.warn('[H-app DB] IndexedDB not available.');
        resolve(null);
        return;
      }
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = (e) => {
        console.error('[H-app DB] Open error:', e.target.error);
        resolve(null);
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        resolve(db);
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          const store = db.createObjectStore(STORE_DRAFTS, { keyPath: 'id' });
          store.createIndex('areaName', 'areaName', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
          const store = db.createObjectStore(STORE_QUEUE, { keyPath: 'id', autoIncrement: true });
          store.createIndex('areaName', 'areaName', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
      };
    });
    return dbPromise;
  }

  async function saveDraft(draft) {
    const db = await initDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_DRAFTS], 'readwrite');
      const store = tx.objectStore(STORE_DRAFTS);
      store.put(draft);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  async function getDraft(id) {
    const db = await initDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_DRAFTS], 'readonly');
      const store = tx.objectStore(STORE_DRAFTS);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  }

  async function getAreaDrafts(areaName) {
    const db = await initDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_DRAFTS], 'readonly');
      const store = tx.objectStore(STORE_DRAFTS);
      const index = store.index('areaName');
      const req = index.getAll(areaName);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async function enqueueSync(item) {
    const db = await initDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_QUEUE], 'readwrite');
      const store = tx.objectStore(STORE_QUEUE);
      store.add({
        ...item,
        syncStatus: 'PENDING',
        createdAt: Date.now()
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  async function getQueue() {
    const db = await initDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_QUEUE], 'readonly');
      const store = tx.objectStore(STORE_QUEUE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  window.HAppDB = {
    initDB,
    saveDraft,
    getDraft,
    getAreaDrafts,
    enqueueSync,
    getQueue
  };

  // Bind global helpers
  window.saveDraft = saveDraft;
  window.getDraft = getDraft;
  window.getAreaDrafts = getAreaDrafts;
  window.enqueueSync = enqueueSync;
  window.getQueue = getQueue;

  initDB();
})(window);
