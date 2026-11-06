/* Vườn Chữ — service worker (chơi offline + cài lên màn hình chính)
   Chiến lược: ƯU TIÊN MẠNG. Khi có internet luôn tải bản mới nhất,
   chỉ dùng cache khi mất mạng — nên bạn cập nhật nội dung là người chơi
   thấy ngay, không bị kẹt bản cũ.
   Muốn xoá sạch cache (khi nghi ngờ lỗi cũ): tăng CACHE_VERSION. */

const CACHE_VERSION = "vuonchu-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/style.css",
  "./assets/ui.js",
  "./assets/audio.js",
  "./assets/app.js",
  "./data/content.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   /* Google Fonts để trình duyệt tự lo */

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(req, copy)).catch(() => null);
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : null))
      )
  );
});
