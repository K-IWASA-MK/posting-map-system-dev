/**
 * POSTING MAP H-app GPS Module
 * Handles geolocation watching, caching, and evidence object creation
 */
(function(window) {
  let latestLocation = { latitude: null, longitude: null, accuracy: null, timestamp: 0 };
  let gpsWatchId = null;

  function startGPSWatching() {
    if (gpsWatchId) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn("[H-app GPS] Geolocation not supported.");
      return;
    }
    gpsWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        latestLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp || Date.now()
        };
        console.log(`[H-app GPS] Location updated: ${latestLocation.latitude}, ${latestLocation.longitude} (${latestLocation.accuracy}m)`);
      },
      (err) => {
        console.warn("[H-app GPS] Watch error:", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  function getGPSLocation() {
    return new Promise((resolve) => {
      // 60秒以内のキャッシュがあれば即座に返却
      if (latestLocation.latitude !== null && (Date.now() - latestLocation.timestamp) < 60000) {
        resolve({
          latitude: latestLocation.latitude,
          longitude: latestLocation.longitude,
          accuracy: latestLocation.accuracy,
          measuredAt: new Date(latestLocation.timestamp).toISOString()
        });
        return;
      }

      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        resolve({ latitude: '', longitude: '', accuracy: null, measuredAt: new Date().toISOString() });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          latestLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp || Date.now()
          };
          resolve({
            latitude: latestLocation.latitude,
            longitude: latestLocation.longitude,
            accuracy: latestLocation.accuracy,
            measuredAt: new Date(latestLocation.timestamp).toISOString()
          });
        },
        (err) => {
          console.warn("[H-app GPS] getCurrentPosition error:", err);
          resolve({ latitude: '', longitude: '', accuracy: null, measuredAt: new Date().toISOString() });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    });
  }

  window.HAppGPS = {
    startGPSWatching,
    getGPSLocation
  };
})(window);
