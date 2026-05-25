const CACHE_NAME = 'posting-map-cache-v245';
const ASSETS = [
  './',
  './index.html',
  './manager.html',
  './style.css',
  './style.css?v=245',
  './app.js',
  './app.js?v=245',
  './render.js',
  './render.js?v=245',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&family=Noto+Sans+JP:wght@400;900&display=swap',
  './assets/icon180-v2.png?v=245',
  './assets/icon-admin-panel-180.png?v=245'
];

// インストール時にアセットをプリキャッシュ
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// アクティベート時に古いキャッシュをクリア
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// リクエストフェッチのインターセプト処理（キャッシュ優先、APIは常にネットワーク）
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // GAS APIへのリクエストはキャッシュせず、常にネットワーク経由で最新データを取得
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') {
    e.respondWith(fetch(e.request));
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        // キャッシュがあれば即時に返しつつ、バックグラウンドで最新ファイルをフェッチしてキャッシュを更新 (Stale-While-Revalidate)
        fetch(e.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* ネットワークオフライン時は単に失敗を無視 */});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
