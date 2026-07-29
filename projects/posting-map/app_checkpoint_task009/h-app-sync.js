/**
 * POSTING MAP H-app Sync & API Transport Module
 * Connects to SSOT GAS Endpoint, handles offline queue, auto-sync upon reconnection
 */
(function(window) {
  let isSyncing = false;

  function getApiUrl() {
    if (window.PMS_CLIENT_CONFIG && window.PMS_CLIENT_CONFIG.api && window.PMS_CLIENT_CONFIG.api.gasWebAppUrl) {
      return window.PMS_CLIENT_CONFIG.api.gasWebAppUrl;
    }
    // Fallback SSOT URL
    return "https://script.google.com/macros/s/AKfycbwgiOFU5iudUS6UscNU-MZhnxZJaqJHywVA9ivA-GE0uLe02fi7mmBU474lWa1TD7-R/exec";
  }

  function setSyncStatus(state) {
    const el = document.getElementById('sync-pct');
    if (!el) return;
    if (state === 'online') {
      el.textContent = '100%';
    } else if (state === 'offline') {
      el.textContent = 'OFFLINE';
    } else if (state === 'syncing') {
      el.textContent = 'SYNC...';
    }
  }

  async function callApiPost(action, payload = {}) {
    const url = `${getApiUrl()}?_t=${Date.now()}`;
    const token = (typeof window.getAuthToken === 'function') ? window.getAuthToken() : 'valid-liff-token';
    const body = JSON.stringify({ action, liffToken: token, ...payload });

    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      redirect: 'follow'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      console.log(`[H-app Sync] Sending POST action=${action}...`);
      const response = await fetch(url, { ...options, body, signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const text = await response.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { throw new Error("Non-JSON API Response"); }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn(`[H-app Sync] POST Error:`, err.message);
      throw err;
    }
  }

  function saveToOfflineQueue(payload) {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    const filtered = queue.filter(item => !(item.areaId === payload.areaId && item.rowId === payload.rowId));
    filtered.push({ ...payload, queuedAt: Date.now() });
    localStorage.setItem('offline_queue', JSON.stringify(filtered));
    setSyncStatus('offline');
    console.log(`[H-app Sync] Saved report to offline queue. Queue length: ${filtered.length}`);
  }

  async function syncOfflineQueue() {
    if (isSyncing) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setSyncStatus('offline');
      return;
    }
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    if (queue.length === 0) {
      setSyncStatus('online');
      return;
    }

    isSyncing = true;
    setSyncStatus('syncing');
    console.log(`[H-app Sync] Processing ${queue.length} offline queued report(s)...`);

    const failedItems = [];
    for (const item of queue) {
      try {
        const result = await callApiPost(item.action || 'submitDistribution', item);
        if (!result || result.success === false) {
          failedItems.push(item);
        }
      } catch (e) {
        console.error('[H-app Sync] Sync item failed:', e);
        failedItems.push(item);
      }
    }

    localStorage.setItem('offline_queue', JSON.stringify(failedItems));
    isSyncing = false;

    if (failedItems.length === 0) {
      console.log('[H-app Sync] All offline items synchronized successfully.');
      setSyncStatus('online');
    } else {
      console.warn(`[H-app Sync] ${failedItems.length} items failed. Will retry.`);
      setSyncStatus('offline');
    }
  }

  // Setup auto event listeners for connectivity changes
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      console.log("[H-app Sync] Network online detected. Triggering queue sync...");
      syncOfflineQueue();
    });
    window.addEventListener('offline', () => {
      console.log("[H-app Sync] Network offline detected.");
      setSyncStatus('offline');
    });
  }

  window.HAppSync = {
    getApiUrl,
    callApiPost,
    saveToOfflineQueue,
    syncOfflineQueue,
    setSyncStatus
  };
})(window);
