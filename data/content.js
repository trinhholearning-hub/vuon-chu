/* =========================================================
   VƯỜN CHỮ — NỘI DUNG (file duy nhất bạn cần sửa khi thêm từ mới)
   ---------------------------------------------------------
   Mỗi chặng:  { id, title, emoji, lessons: [ ... ] }
   Mỗi bài:    { id, title, words: [ ["english","nghĩa việt","emoji"], ... ] }
   - id phải DUY NHẤT (đây là khoá lưu tiến độ của người chơi)
   - mỗi bài nên có 4 từ; câu hỏi được sinh tự động (8 câu/bài)
   - từ tiếng Anh nên từ 3 ký tự trở lên
   ========================================================= */

/* =========================================================
   1. DỮ LIỆU TỪ VỰNG
   ========================================================= */
const UNITS = [
  { id:"u1", title:"Động vật quanh em", emoji:"🐾", lessons:[
    { id:"u1l1", title:"Mèo, chó và bạn bè", words:[["cat","con mèo","🐱"],["dog","con chó","🐶"],["bird","con chim","🐦"],["fish","con cá","🐟"]] },
    { id:"u1l2", title:"Ở nông trại", words:[["cow","con bò","🐮"],["pig","con lợn","🐷"],["duck","con vịt","🦆"],["hen","con gà mái","🐔"]] },
    { id:"u1l3", title:"Rừng xanh", words:[["elephant","con voi","🐘"],["tiger","con hổ","🐯"],["monkey","con khỉ","🐵"],["rabbit","con thỏ","🐰"]] },
    { id:"u1l4", title:"Ôn tập động vật", words:[["cat","con mèo","🐱"],["duck","con vịt","🦆"],["tiger","con hổ","🐯"],["rabbit","con thỏ","🐰"]] }
  ]},
  { id:"u2", title:"Trái cây và màu sắc", emoji:"🍎", lessons:[
    { id:"u2l1", title:"Trái cây trong vườn", words:[["apple","quả táo","🍎"],["banana","quả chuối","🍌"],["orange","quả cam","🍊"],["grape","quả nho","🍇"]] },
    { id:"u2l2", title:"Trái cây mùa hè", words:[["mango","quả xoài","🥭"],["watermelon","quả dưa hấu","🍉"],["strawberry","quả dâu tây","🍓"],["lemon","quả chanh","🍋"]] },
    { id:"u2l3", title:"Bốn màu cơ bản", words:[["red","màu đỏ","🔴"],["blue","màu xanh dương","🔵"],["yellow","màu vàng","🟡"],["green","màu xanh lá","🟢"]] },
    { id:"u2l4", title:"Ôn tập trái cây", words:[["apple","quả táo","🍎"],["mango","quả xoài","🥭"],["yellow","màu vàng","🟡"],["green","màu xanh lá","🟢"]] }
  ]},
  { id:"u3", title:"Gia đình và số đếm", emoji:"👨‍👩‍👧", lessons:[
    { id:"u3l1", title:"Người thân của con", words:[["mother","mẹ","👩"],["father","bố","👨"],["sister","chị gái","👧"],["brother","anh trai","👦"]] },
    { id:"u3l2", title:"Cả nhà quây quần", words:[["baby","em bé","👶"],["grandmother","bà","👵"],["grandfather","ông","👴"],["family","gia đình","👨‍👩‍👧‍👦"]] },
    { id:"u3l3", title:"Đếm từ một đến năm", words:[["one","số một","1️⃣"],["two","số hai","2️⃣"],["three","số ba","3️⃣"],["four","số bốn","4️⃣"],["five","số năm","5️⃣"]] },
    { id:"u3l4", title:"Ôn tập gia đình", words:[["mother","mẹ","👩"],["baby","em bé","👶"],["two","số hai","2️⃣"],["five","số năm","5️⃣"]] }
  ]},
  { id:"u4", title:"Ở trường học", emoji:"🎒", lessons:[
    { id:"u4l1", title:"Trong cặp sách", words:[["book","quyển sách","📕"],["pen","cái bút","🖊️"],["ruler","cái thước","📏"],["bag","cái cặp","🎒"]] },
    { id:"u4l2", title:"Lớp học của con", words:[["teacher","cô giáo","🧑‍🏫"],["student","học sinh","🧑‍🎓"],["school","trường học","🏫"],["chair","cái ghế","🪑"]] },
    { id:"u4l3", title:"Đồ dùng học tập", words:[["pencil","bút chì","✏️"],["crayon","bút sáp","🖍️"],["notebook","quyển vở","📓"],["scissors","cái kéo","✂️"]] },
    { id:"u4l4", title:"Ôn tập trường học", words:[["book","quyển sách","📕"],["teacher","cô giáo","🧑‍🏫"],["pencil","bút chì","✏️"],["scissors","cái kéo","✂️"]] }
  ]},
  { id:"u5", title:"Đồ ăn và thức uống", emoji:"🍚", lessons:[
    { id:"u5l1", title:"Bữa cơm nhà mình", words:[["rice","cơm","🍚"],["bread","bánh mì","🍞"],["milk","sữa","🥛"],["water","nước","💧"]] },
    { id:"u5l2", title:"Món ăn bé thích", words:[["egg","quả trứng","🥚"],["meat","thịt","🍖"],["soup","canh","🍲"],["cake","bánh ngọt","🍰"]] },
    { id:"u5l3", title:"Đồ uống và món ngọt", words:[["juice","nước ép","🧃"],["tea","trà","🍵"],["ice cream","kem","🍦"],["candy","kẹo","🍬"]] },
    { id:"u5l4", title:"Ôn tập đồ ăn", words:[["rice","cơm","🍚"],["egg","quả trứng","🥚"],["juice","nước ép","🧃"],["ice cream","kem","🍦"]] }
  ]},
  { id:"u6", title:"Cơ thể và quần áo", emoji:"🧢", lessons:[
    { id:"u6l1", title:"Khuôn mặt bé", words:[["eye","mắt","👁️"],["ear","tai","👂"],["nose","mũi","👃"],["mouth","miệng","👄"]] },
    { id:"u6l2", title:"Tay, chân và hơn thế", words:[["hand","bàn tay","✋"],["foot","bàn chân","🦶"],["hair","mái tóc","💇"],["tooth","cái răng","🦷"]] },
    { id:"u6l3", title:"Quần áo bé mặc", words:[["shirt","cái áo","👕"],["pants","cái quần","👖"],["shoes","đôi giày","👟"],["hat","cái mũ","🧢"]] },
    { id:"u6l4", title:"Ôn tập cơ thể", words:[["eye","mắt","👁️"],["hand","bàn tay","✋"],["shirt","cái áo","👕"],["shoes","đôi giày","👟"]] }
  ]}
];

const FLOWERS = [0,1,2,3,4,5,6,7,8,9];
const TITLES = ["Mầm non","Chồi nhỏ","Lá xanh","Nụ hoa","Bông hoa","Trái ngọt","Người làm vườn","Bàn tay xanh","Người giữ vườn","Huyền thoại vườn chữ"];
const DAILY_GOAL = 40;
const HEART_REFILL_MS = 60000;

/* ---------- màu của từng chặng (tự quay vòng nếu thiếu) ---------- */
const UNIT_ACCENTS = ["#E39A2E","#E0698A","#4E93C8","#D2A02A","#4C9A62","#7C6BC4"];
const UNIT_TINTS   = ["#FFE7C2","#FFDDE7","#D8ECFB","#FFF1C0","#DBF0DC","#E7E1FB"];

/* ---------- tham số luật chơi (sửa được) ---------- */
const XP_BASE = 25;          /* XP nhận được khi xong 1 bài */
const XP_PER_CORRECT = 3;    /* XP cộng thêm cho mỗi câu đúng */
const XP_START = 40;         /* XP cần để lên cấp 2 */
const XP_STEP = 12;          /* mỗi cấp sau cần thêm bao nhiêu XP */
