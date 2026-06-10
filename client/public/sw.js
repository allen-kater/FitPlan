// FitPlan Service Worker - 离线缓存策略
// Cache First for static assets, Network First for API

const CACHE_NAME = 'fitplan-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// 静态资源文件扩展名
const STATIC_EXTENSIONS = [
  '.js', '.css', '.html', '.json', '.svg', '.png', '.jpg', '.jpeg',
  '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot',
];

/** 判断请求是否为静态资源 */
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

/** 判断请求是否为API请求 */
function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

// 安装事件：预缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 请求拦截：根据资源类型使用不同缓存策略
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  // API请求：Network First（优先网络，失败则读缓存）
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 缓存成功的API响应（仅GET请求）
          if (event.request.method === 'GET' && response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络失败时，返回缓存
          return caches.match(event.request);
        })
    );
    return;
  }

  // 静态资源：Cache First（优先缓存，失败则请求网络）
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // 后台更新缓存
          fetch(event.request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {});
          return cachedResponse;
        }
        // 缓存中没有，从网络获取
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML页面：Network First
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/index.html');
        });
      })
  );
});
