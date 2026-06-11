const CACHE_NAME = 'posting-map-cache-v454';
const ASSETS = [
  './',
  './index.html',
  './manager.html',
  './style.css',
  './tailwind-utils.css',
  './db.js',
  './app.js',
  './app.js?v=454',
  './render.js',
  './manifest.json',
  './stock.html',
  // 外部CDN URLはCORSポリシーによりキャッシュ失敗の原因になるため除外
  './assets/icon180-v2.png?v=257',
  './assets/icon-admin-panel-180.png?v=243'
];

// HTMLファイルかどうか判定（Networkファーストで処理するため）
function isHtmlRequest(url) {
  const path = url.pathname;
  return path.endsWith('/') || path.endsWith('.html') || !path.includes('.');
}

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

// リクエストフェッチのインターセプト処理
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  
  // GAS APIへのリクエストはキャッシュせず、常にネットワーク経由で最新データを取得
  if (url.hostname === 'script.google.com' || url.hostname === 'script.googleusercontent.com') {
    e.respondWith(fetch(e.request));
    return;
  }

  // HTMLファイルはNetwork-First（常に最新バージョンを取得し、失敗時のみキャッシュ使用）
  if (isHtmlRequest(url)) {
    e.respondWith(
      fetch(e.request)
        .then(networkResponse => {
          if (networkResponse.status === 200) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, cloned));
          }
          return networkResponse;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // CSS/JS/画像はStale-While-Revalidate（バージョン番号付きのため安全）
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      if (cachedResponse) {
        // キャッシュを即時返しつつ、バックグラウンドで更新
        fetch(e.request).then(networkResponse => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResponse));
          }
        }).catch(() => {/* オフライン時は無視 */});
        return cachedResponse;
      }
      return fetch(e.request);
    })
  );
});
