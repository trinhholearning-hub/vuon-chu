#!/usr/bin/env node
/* Kiểm tra file nội dung trước khi đăng lên web.
   Cách chạy:  node tools/validate.js
   (chỉ cần Node.js, không cần cài thêm gì) */

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const FILE = path.join(__dirname, "..", "data", "content.js");
const src = fs.readFileSync(FILE, "utf8");

let data;
try {
  data = vm.runInNewContext(
    src + "\n;({UNITS, FLOWERS, TITLES, DAILY_GOAL, HEART_REFILL_MS, XP_BASE, XP_PER_CORRECT, XP_START, XP_STEP})",
    {}
  );
} catch (e) {
  console.error("✗ Không đọc được data/content.js — lỗi cú pháp:");
  console.error("  " + e.message);
  process.exit(1);
}

const { UNITS } = data;
const errors = [];
const warns = [];
const err = m => errors.push(m);
const warn = m => warns.push(m);

const unitIds = new Set();
const lessonIds = new Set();
const allWords = new Set();
let lessonCount = 0;
let wordCount = 0;

if (!Array.isArray(UNITS) || !UNITS.length) err("UNITS phải là một mảng có ít nhất 1 chặng.");

(UNITS || []).forEach((u, ui) => {
  const where = "chặng " + (ui + 1);
  if (!u.id) err(where + ": thiếu id");
  else if (unitIds.has(u.id)) err(where + ': id bị trùng "' + u.id + '"');
  else unitIds.add(u.id);
  if (!u.title) err(where + ": thiếu title");
  if (!Array.isArray(u.lessons) || !u.lessons.length) err(where + ": không có bài nào");

  (u.lessons || []).forEach((l, li) => {
    lessonCount++;
    const at = where + " / bài " + (li + 1);
    if (!l.id) err(at + ": thiếu id");
    else if (lessonIds.has(l.id)) err(at + ': id bị trùng "' + l.id + '"');
    else lessonIds.add(l.id);
    if (!l.title) err(at + ": thiếu title");
    if (!Array.isArray(l.words) || !l.words.length) { err(at + ": không có từ nào"); return; }
    if (l.words.length < 3) warn(at + ": chỉ có " + l.words.length + " từ (nên 4 từ)");
    if (l.words.length > 6) warn(at + ": có " + l.words.length + " từ (nhiều hơn 6 thì bài sẽ dài)");

    const viSeen = new Map();
    const enSeen = new Set();
    l.words.forEach((w, wi) => {
      const wt = at + " / từ " + (wi + 1);
      if (!Array.isArray(w) || w.length < 3) { err(wt + ': phải là ["english","nghĩa việt","emoji"]'); return; }
      const [en, vi, emoji] = w.map(x => (x == null ? "" : String(x).trim()));
      if (!en) err(wt + ": thiếu từ tiếng Anh");
      if (!vi) err(wt + ": thiếu nghĩa tiếng Việt");
      if (!emoji) warn(wt + ' ("' + en + '"): thiếu emoji, câu "nhìn hình" sẽ trống');
      if (en && en.length < 3) warn(wt + ' ("' + en + '"): từ quá ngắn, câu điền chữ cái sẽ dễ');
      if (en && !/^[a-zA-Z][a-zA-Z ]*$/.test(en)) warn(wt + ' ("' + en + '"): nên chỉ dùng chữ cái và dấu cách');
      if (en) { wordCount++; allWords.add(en); }
      if (en && enSeen.has(en)) warn(wt + ' ("' + en + '"): lặp lại trong cùng bài');
      if (en) enSeen.add(en);
      if (vi) {
        if (viSeen.has(vi)) warn(wt + ': nghĩa "' + vi + '" trùng với từ ' + (viSeen.get(vi) + 1) + " trong bài");
        else viSeen.set(vi, wi);
      }
    });
  });
});

if (wordCount === 0) err("Không có từ vựng nào.");
if (!Array.isArray(data.TITLES) || !data.TITLES.length) err("TITLES rỗng");
["XP_BASE", "XP_PER_CORRECT", "XP_START", "XP_STEP", "DAILY_GOAL", "HEART_REFILL_MS"]
  .forEach(k => { if (typeof data[k] !== "number" || !isFinite(data[k])) err(k + " phải là một số"); });

console.log("— Vườn Chữ · kiểm tra nội dung —");
console.log("  " + (UNITS || []).length + " chặng · " + lessonCount + " bài · " +
            wordCount + " lượt từ · " + allWords.size + " từ khác nhau · " +
            (lessonCount * 8) + " câu hỏi sẽ được sinh ra");

if (warns.length) {
  console.log("\n⚠ " + warns.length + " cảnh báo (không chặn chạy):");
  warns.forEach(w => console.log("   · " + w));
}
if (errors.length) {
  console.log("\n✗ " + errors.length + " lỗi cần sửa:");
  errors.forEach(e => console.log("   · " + e));
  process.exit(1);
}
console.log("\n✓ Nội dung hợp lệ, có thể đăng lên web.");
