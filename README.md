# Vườn Chữ — web tĩnh

Game học tiếng Anh cho bé, phong cách vẽ tay bằng bút chì màu. Toàn bộ là **file tĩnh** (HTML/CSS/JS), không cần máy chủ, không cần cơ sở dữ liệu — tải lên đâu cũng chạy.

## 1. Trong thư mục có gì

```
index.html              khung trang (chỉ có markup, không có code)
assets/
  style.css             toàn bộ giao diện (màu, nét vẽ tay, responsive)
  ui.js                 bộ icon + hình vẽ SVG (tim, hoa, chú Mầm, doodle)
  audio.js              hiệu ứng âm thanh (WebAudio) + giọng đọc tiếng Anh
  app.js                logic game: câu hỏi, XP, tim, chuỗi ngày, sổ từ
data/
  content.js            ★ DỮ LIỆU: từ vựng, tên chặng, màu chặng, luật XP
icons/                  icon ứng dụng + ảnh chia sẻ mạng xã hội (og.png)
sw.js                   service worker: chơi offline, cài lên màn hình chính
manifest.webmanifest    khai báo PWA (tên, icon, màu)
tools/validate.js       kiểm tra nội dung trước khi đăng
```

**Bạn chỉ cần sửa `data/content.js` khi muốn thêm/sửa từ vựng.** Các file còn lại chỉ đụng tới khi sửa giao diện hoặc sửa lỗi.

## 2. Chạy thử trên máy

Cách nhanh nhất — mở thẳng file:

```
mở index.html bằng trình duyệt (double-click)
```

Cách đúng như khi đăng web (cần cho service worker / cài PWA):

```
cd vuonchu-web
npx serve .          # hoặc:  python3 -m http.server 8000
```

rồi mở `http://localhost:8000`.

> Lưu ý: mở bằng `file://` thì game vẫn chạy đầy đủ, chỉ có service worker (chơi offline) là không hoạt động.

## 3. Sửa / thêm từ vựng

Mở `data/content.js`. Mỗi từ là một mảng 3 phần:

```js
["cat", "con mèo", "🐱"]
//  từ tiếng Anh, nghĩa tiếng Việt, emoji minh hoạ
```

Thêm một bài mới = copy một dòng bài, đổi `id`:

```js
{ id:"u1l5", title:"Thú trong vườn", words:[
    ["ant","con kiến","🐜"],
    ["bee","con ong","🐝"],
    ["snail","con ốc sên","🐌"],
    ["worm","con giun","🪱"]
]},
```

Thêm một chặng mới = copy cả khối `{ id:"u7", ... }`, đổi mọi `id` bên trong (`u7l1`, `u7l2`…).

**Quy tắc:**
- `id` phải duy nhất — đó là khoá lưu tiến độ của người chơi.
- Mỗi bài nên có 4 từ (tối thiểu 3). Câu hỏi được sinh tự động: 8 câu/bài, 4 dạng (nhìn hình, nghĩa tiếng Việt, nghe, điền chữ cái).
- Từ tiếng Anh từ 3 ký tự trở lên; chỉ dùng chữ cái và dấu cách.
- Màu từng chặng: sửa `UNIT_ACCENTS` / `UNIT_TINTS` trong cùng file (mảng tự quay vòng).

**Kiểm tra sau khi sửa:**

```
node tools/validate.js
```

Script sẽ báo lỗi (id trùng, thiếu nghĩa, sai định dạng) và cảnh báo (thiếu emoji, từ quá ngắn, nghĩa bị lặp trong bài). Sửa hết lỗi rồi mới đăng.

## 4. Đổi luật chơi

Cũng trong `data/content.js`:

```js
const XP_BASE = 25;          // XP mỗi bài
const XP_PER_CORRECT = 3;    // XP thêm cho mỗi câu đúng
const XP_START = 40;         // XP cần để lên cấp 2
const XP_STEP = 12;          // mỗi cấp sau cần thêm
const DAILY_GOAL = 40;       // mục tiêu XP mỗi ngày
const HEART_REFILL_MS = 60000; // thời gian hồi 1 tim
```

Số tim tối đa, giá đồ trong chợ lá: tìm `maxHearts` và `const SHOP =` trong `assets/app.js`.

## 5. Sửa lỗi

- **Lỗi giao diện / màu / bố cục** → `assets/style.css`. Đầu file có bảng màu (`:root`), cuối file là các `@media` cho điện thoại.
- **Lỗi logic** → `assets/app.js`. Các mục được đánh số trong comment: sinh câu hỏi, bản đồ bài, luồng bài học, kết quả, overlay, sổ từ, khuyến mãi confetti, gắn sự kiện, khởi động.
- **Lỗi hiển thị hình vẽ** → `assets/ui.js`.
- **Không nghe thấy âm thanh** → kiểm tra nút loa ở góc phải; trên iOS, âm thanh chỉ bật sau lần chạm đầu tiên (đúng chuẩn trình duyệt).
- Người chơi bị "kẹt" ở bản cũ: mở `sw.js`, tăng `CACHE_VERSION` lên `vuonchu-v2`, đăng lại.

## 6. Đăng lên web để lấy link

Chọn một trong các cách sau — tất cả đều miễn phí và không cần cấu hình gì thêm.

### Cách A — Netlify Drop (nhanh nhất, ~1 phút)

1. Vào `app.netlify.com/drop`.
2. Kéo **cả thư mục** `vuonchu-web` vào trang.
3. Nhận link dạng `https://ten-ngau-nhien.netlify.app`.
4. Đổi tên miền phụ: Site settings → Change site name.

### Cách B — GitHub Pages (dễ cập nhật lâu dài)

1. Tạo repository mới, tải toàn bộ file lên (giữ nguyên cấu trúc thư mục).
2. Settings → Pages → Source: `Deploy from a branch` → Branch: `main` / thư mục `/ (root)` → Save.
3. Sau ~1 phút, link là `https://<tài-khoản>.github.io/<tên-repo>/`.
4. Mỗi lần sửa nội dung: upload lại file `data/content.js` là xong.

### Cách C — Cloudflare Pages / Vercel

Cũng là kéo-thả hoặc nối với GitHub. Chọn "static site", không cần build command, thư mục gốc là thư mục chứa `index.html`.

> Cả ba cách đều cho **HTTPS**, nên service worker hoạt động: người chơi cài được game lên màn hình chính và chơi khi mất mạng.

## 7. Chia sẻ link

- Link chơi: `https://…/` (gửi qua Zalo / Messenger / SMS đều được).
- Ảnh xem trước khi dán link: `icons/og.png` (1200×630). Một số nền tảng cần đường dẫn tuyệt đối — nếu ảnh không hiện, sửa `og:image` trong `index.html` thành `https://tên-miền-của-bạn/icons/og.png`.
- Mỗi người chơi có tiến độ riêng, lưu trong trình duyệt của họ (`localStorage`, khoá `vuonchu.v1`). **Đổi tên miền = mất tiến độ cũ**, nên chốt tên miền trước khi gửi cho nhiều người.

## 8. Những gì KHÔNG cần

Không cần npm install, không cần build, không cần Node trên máy chủ (Node chỉ dùng để chạy `tools/validate.js` khi bạn muốn kiểm tra nội dung). Font chữ tải từ Google Fonts; nếu mạng chậm, game vẫn chạy với font hệ thống.
