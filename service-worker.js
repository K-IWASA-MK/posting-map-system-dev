const CACHE_NAME = 'posting-map-cache-v383';
const ASSETS = [
  './',
  './index.html',
  './manager.html',
  './style.css',
  './style.css?v=383',
  './tailwind-utils.css',
  './tailwind-utils.css?v=319',
  './db.js',
  './db.js?v=383',
  './app.js',
  './app.js?v=383',
  './render.js',
  './render.js?v=383',
  './manifest.json',
  // 外部CDN URLはCORSポリシーによりキャッシュ失敗の原因になるため除外
  './assets/icon180-v2.png?v=257',
  './assets/icon-admin-panel-180.png?v=243'
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
