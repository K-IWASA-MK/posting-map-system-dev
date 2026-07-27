/**
 * POSTING MAP H-app Workflow & Numpad Module
 * Controls HOME (Area Selection) -> WORK (Deployment & GPS/Photo) -> DONE (Submission)
 */
(function(window) {
  let numpadContext = null;
  let activeMission = null; // { areaId, areaName, totalTarget, doneCount, photoBlob, photoBase64, gps }

  function openNumpad(areaId, areaName, currentCount = 0, onConfirmCallback = null) {
    numpadContext = {
      areaId,
      areaName,
      currentVal: currentCount ? String(currentCount) : '0',
      onConfirm: onConfirmCallback
    };

    const display = document.getElementById('numpad-display');
    if (display) display.textContent = numpadContext.currentVal;

    const modal = document.getElementById('numpad-modal');
    if (modal) {
      modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
    }
  }

  function closeNumpad() {
    const modal = document.getElementById('numpad-modal');
    if (modal) {
      modal.classList.add('hidden', 'opacity-0', 'pointer-events-none');
    }
    numpadContext = null;
  }

  function pressNum(key) {
    if (!numpadContext) return;

    if (key === 'C') {
      numpadContext.currentVal = '0';
    } else if (key === 'OK') {
      const valNum = parseInt(numpadContext.currentVal, 10) || 0;
      if (numpadContext.onConfirm) {
        numpadContext.onConfirm(valNum);
      }
      closeNumpad();
      return;
    } else {
      if (numpadContext.currentVal === '0') {
        numpadContext.currentVal = String(key);
      } else {
        if (numpadContext.currentVal.length < 5) {
          numpadContext.currentVal += String(key);
        }
      }
    }

    const display = document.getElementById('numpad-display');
    if (display) display.textContent = numpadContext.currentVal;
  }

  // 1回の完全配布アクティビティ送信ワークフロー
  async function submitFieldReport({ areaId, areaName, count, photoBase64, gpsLocation }) {
    const user = window.currentUser || { name: '岩佐CEO', userId: 'U_IWASA_CEO_OFFICIAL' };
    const payload = {
      action: 'submitDistribution',
      areaId: areaId || 'MIE03_MAIN',
      areaName: areaName || '三重第3区',
      count: count || 0,
      photoBase64: photoBase64 || '',
      latitude: gpsLocation?.latitude || '',
      longitude: gpsLocation?.longitude || '',
      accuracy: gpsLocation?.accuracy || null,
      measuredAt: gpsLocation?.measuredAt || new Date().toISOString(),
      staffId: user.userId || 'U_IWASA_CEO_OFFICIAL',
      staffName: user.name || user.displayName || '岩佐CEO'
    };

    console.log('[H-app Workflow] Submitting Field Report:', payload);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      window.HAppSync.saveToOfflineQueue(payload);
      if (typeof window.showToast === 'function') window.showToast('オフライン保存しました (通信復帰時に同期)');
      return { success: true, offline: true };
    }

    try {
      const res = await window.HAppSync.callApiPost('submitDistribution', payload);
      if (res && res.success !== false) {
        if (typeof window.showToast === 'function') window.showToast('配布実績をGASへ送信完了!');
        return { success: true, res };
      } else {
        console.warn('[H-app Workflow] GAS Response Fail. Saving offline:', res);
        window.HAppSync.saveToOfflineQueue(payload);
        if (typeof window.showToast === 'function') window.showToast('送信失敗のためオフライン保存しました', true);
        return { success: false, offline: true };
      }
    } catch (err) {
      console.error('[H-app Workflow] Transmission Error:', err);
      window.HAppSync.saveToOfflineQueue(payload);
      if (typeof window.showToast === 'function') window.showToast('通信エラーのためオフライン保存しました', true);
      return { success: false, offline: true };
    }
  }

  window.HAppWorkflow = {
    openNumpad,
    closeNumpad,
    pressNum,
    submitFieldReport
  };
})(window);
