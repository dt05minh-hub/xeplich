# HƯỚNG DẪN CẤU HÌNH & CHẠY UNG DỤNG WEB LÊN ĐIỆN THOẠI (PROGRESSIVE WEB APP - PWA)

Hệ thống **Adaptive Personal Planner** đã được tích hợp đầy đủ tiêu chuẩn **PWA (Progressive Web App)**. 

Khi truy cập trang web từ điện thoại hoặc máy tính, trình duyệt sẽ cho phép người dùng **"Cài đặt"** hoặc **"Thêm vào Màn hình chính"** (Add to Home Screen). Trang web sẽ chạy dưới dạng một ứng dụng di động độc lập, có biểu tượng (icon) riêng, mở toàn màn hình (không có thanh địa chỉ trình duyệt) và hỗ trợ lưu bộ nhớ đệm ngoại tuyến.

---

## 1. CÁC TỆP ĐÃ ĐƯỢC TẠO DÙNG CHO PWA (Có thể sao chép trực tiếp)

### A. Tệp `public/manifest.json`
Tệp cấu hình thông tin ứng dụng di động (Tên, màu chủ đề, chế độ hiển thị `standalone`, icon):

```json
{
  "short_name": "AdaptivePlanner",
  "name": "Adaptive Personal Planner - Quản Lý Thời Gian AI",
  "description": "Hệ thống lập lịch cá nhân thông minh thích ứng theo hành vi và năng lượng với Google Gemini AI",
  "icons": [
    {
      "src": "/pwa-192x192.svg",
      "type": "image/svg+xml",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "/pwa-512x512.svg",
      "type": "image/svg+xml",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "background_color": "#f8fafc",
  "theme_color": "#4f46e5",
  "display": "standalone",
  "orientation": "portrait-primary",
  "scope": "/",
  "categories": ["productivity", "utilities", "lifestyle"]
}
```

---

### B. Tệp `public/sw.js` (Service Worker)
Quản lý bộ nhớ đệm (Cache) để ứng dụng chạy nhanh và đáp ứng tiêu chuẩn PWA cài đặt:

```javascript
const CACHE_NAME = 'adaptive-planner-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.svg',
  '/pwa-512x512.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin) || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
```

---

### C. Thẻ Meta PWA trong `index.html`

```html
<!-- PWA Primary Meta Tags -->
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#4f46e5" />
<meta name="description" content="Hệ thống lập lịch cá nhân thích ứng AI." />

<!-- iOS / Safari Mobile App Support -->
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="AdaptivePlanner" />
<link rel="apple-touch-icon" href="/pwa-192x192.svg" />
<link rel="icon" type="image/svg+xml" href="/pwa-192x192.svg" />
```

---

### D. Đăng ký Service Worker trong `src/main.tsx`

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('[PWA] ServiceWorker registered with scope: ', registration.scope);
      },
      (err) => {
        console.warn('[PWA] ServiceWorker registration failed: ', err);
      }
    );
  });
}
```

---

## 2. HƯỚNG DẪN CÀI ĐẶT LÊN ĐIỆN THOẠI CHO NGƯỜI DÙNG

### 📱 Trên iPhone / iPad (Safari)
1. Mở trang web bằng trình duyệt **Safari**.
2. Nhấn vào biểu tượng **Chia sẻ (Share)** 📤 ở thanh công cụ dưới cùng.
3. Cuộn xuống chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** ➕.
4. Chọn **Thêm (Add)** ở góc trên phải. Biểu tượng ứng dụng sẽ xuất hiện ngoài màn hình chính của iPhone!

### 🤖 Trên Android (Google Chrome / Edge)
1. Mở trang web bằng trình duyệt **Chrome**.
2. Nhấn vào biểu tượng thanh thông báo **"Cài đặt ứng dụng"** hiển thị trên trang web, HOẶC bấm vào **dấu 3 chấm (⋮)** ở góc trên phải Chrome.
3. Chọn **"Cài đặt ứng dụng"** (Install app) hoặc **"Thêm vào Màn hình chính"**.
4. Xạ nhận cài đặt. Ứng dụng sẽ được tạo thành App độc lập trên điện thoại!

---

## 3. CÁCH LƯU CÁC TỆP NÀY VÀO GIT REPOSITORY CỦA BẠN

Chạy các lệnh sau trong Terminal máy tính của bạn:

```bash
git add .
git commit -m "Add full PWA support with manifest, service worker and install guide"
git push origin main
```
