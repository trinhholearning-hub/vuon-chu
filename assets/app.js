/* =========================================================
   3. TIỆN ÍCH
   ========================================================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const shuffle = a => { const b = a.slice(); for(let i=b.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; };
const pick = a => a[Math.floor(Math.random()*a.length)];

/* chuẩn hoá dữ liệu */


const ORDER = [];
UNITS.forEach((u, ui) => {
  u.index = ui;
  u.accent = UNIT_ACCENTS[ui % UNIT_ACCENTS.length];
  u.tint = UNIT_TINTS[ui % UNIT_TINTS.length];
  u.lessons.forEach((l, li) => {
    l.unit = u; l.idx = li; l.gi = ORDER.length;
    l.words = l.words.map(w => ({ en:w[0], vi:w[1], emoji:w[2], unit:u.id, lesson:l.id }));
    ORDER.push(l);
  });
});
const ALL_WORDS = ORDER.flatMap(l => l.words).filter((w,i,a) => a.findIndex(x=>x.en===w.en) === i);
const LESSON_BY_ID = id => ORDER.find(l => l.id === id);

/* =========================================================
   2. TRẠNG THÁI
   ========================================================= */
const KEY = "vuonchu.v1";
const todayStr = () => new Date().toISOString().slice(0,10);
const yesterdayStr = () => new Date(Date.now() - 864e5).toISOString().slice(0,10);

function freshState(){
  return {
    level:1, xp:0, totalXp:0, hearts:5, maxHearts:5, leaves:30,
    streak:0, bestStreak:0, lastDay:null, todayDate:null, todayXp:0,
    done:{}, garden:[], sound:true, shield:false, heartAt:Date.now()
  };
}
let state = load();

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return freshState();
    const s = Object.assign(freshState(), JSON.parse(raw));
    s.done = s.done || {}; s.garden = s.garden || [];
    return s;
  }catch(e){ return freshState(); }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){}
}
function needXp(level){ return XP_START + (level - 1) * XP_STEP; }
function titleOf(level){ return TITLES[Math.min(level - 1, TITLES.length - 1)]; }

/* hồi tim theo thời gian */
function tickHearts(){
  if(state.hearts >= state.maxHearts){ state.heartAt = Date.now(); return; }
  const gained = Math.floor((Date.now() - state.heartAt) / HEART_REFILL_MS);
  if(gained > 0){
    state.hearts = Math.min(state.maxHearts, state.hearts + gained);
    state.heartAt = Date.now();
    save(); paintChrome();
  }
}

/* =========================================================
   4. SINH CÂU HỎI
   ========================================================= */
function distractors(word, n, key){
  const same = ALL_WORDS.filter(w => w.en !== word.en && w.unit === word.unit);
  const others = ALL_WORDS.filter(w => w.en !== word.en && w.unit !== word.unit);
  const pool = shuffle(same).concat(shuffle(others));
  const out = [];
  for(const w of pool){
    if(out.length >= n) break;
    if(out.some(x => x[key] === w[key])) continue;
    if(w[key] === word[key]) continue;
    out.push(w);
  }
  return out;
}

function makeQuestion(word, kind){
  if(kind === "emoji"){
    const opts = shuffle([word].concat(distractors(word, 3, "en")));
    return { kind, word, prompt:"Hình này là từ nào?", options:opts.map(w=>w.en), answer:word.en };
  }
  if(kind === "vi"){
    const opts = shuffle([word].concat(distractors(word, 3, "vi")));
    return { kind, word, prompt:"“" + word.en + "” nghĩa là gì?", options:opts.map(w=>w.vi), answer:word.vi };
  }
  if(kind === "listen"){
    const opts = shuffle([word].concat(distractors(word, 3, "en")));
    return { kind, word, prompt:"Nghe rồi chọn từ con vừa nghe", options:opts.map(w=>w.en), answer:word.en, speak:word.en };
  }
  /* spell: ẩn một chữ cái (giữ nguyên dấu cách với cụm hai từ) */
  const en = word.en;
  const spots = [];
  for(let i=0;i<en.length;i++){ if(en[i] !== " ") spots.push(i); }
  const hideIdx = spots[Math.max(1, Math.floor(spots.length / 2))];
  const hidden = en[hideIdx];
  const masked = en.slice(0, hideIdx) + "_" + en.slice(hideIdx + 1);
  const letters = "abcdefghijklmnopqrstuvwxyz".split("").filter(c => c !== hidden);
  const opts = shuffle([hidden].concat(shuffle(letters).slice(0, 3)));
  return { kind, word, prompt:"Chọn chữ cái còn thiếu", options:opts, answer:hidden, masked, hidden, en };
}

function buildQuestions(lesson){
  const kinds = ["emoji","vi","listen","spell"];
  const ws = lesson.words;
  const qs = [];
  for(let i=0;i<8;i++){
    const w = ws[i % ws.length];
    const kind = kinds[(i + Math.floor(i / ws.length)) % kinds.length];
    qs.push(makeQuestion(w, kind));
  }
  return shuffle(qs);
}

/* =========================================================
   5. CHROME / ĐIỀU HƯỚNG
   ========================================================= */
function paintChrome(){
  $("#chipStreak").textContent = state.streak;
  $("#chipHearts").textContent = state.hearts;
  $("#chipLeaves").textContent = state.leaves;
  $("#chipXp").textContent = state.xp;
  $("#lvlNum").textContent = state.level;
  $("#lvlTitle").textContent = titleOf(state.level);
  $("#railLevel").textContent = state.level;
  $("#soundBtn").innerHTML = icon(state.sound ? "speaker" : "speakerOff");
  $("#soundBtn").setAttribute("aria-pressed", state.sound ? "true" : "false");
  paintGoal();
}

function paintGoal(){
  if(state.todayDate !== todayStr()){ state.todayDate = todayStr(); state.todayXp = 0; }
  const pct = Math.min(1, state.todayXp / DAILY_GOAL);
  const circ = 2 * Math.PI * 34;
  const ring = $("#goalRing");
  ring.setAttribute("stroke-dasharray", circ.toFixed(1));
  ring.setAttribute("stroke-dashoffset", (circ * (1 - pct)).toFixed(1));
  $("#goalPct").textContent = Math.round(pct * 100) + "%";
  $("#goalTitle").textContent = state.todayXp + " / " + DAILY_GOAL + " XP";
  $("#goalSub").textContent = pct >= 1
    ? "Đạt mục tiêu rồi! Mầm tự thưởng cho con một tràng pháo tay 🎉"
    : "Con còn " + (DAILY_GOAL - state.todayXp) + " XP nữa thôi.";
  const bed = $("#gardenBed");
  $("#gardenCount").textContent = state.garden.length + " bông hoa";
  bed.innerHTML = state.garden.length
    ? state.garden.slice(-12).map((f,i) => '<span class="garden__plant">' + flowerSVG(Number(f) + i) + '</span>').join("")
    : '<p class="garden__empty">Chưa có hoa nào. Học xong một bài để lên cấp và gieo bông hoa đầu tiên nhé!</p>';
}

const SCREENS = ["path","lesson","result","collection"];
function showScreen(name){
  SCREENS.forEach(s => {
    const el = $("#screen-" + s);
    if(el) el.classList.toggle("is-on", s === name);
  });
  document.body.classList.toggle("is-lesson", name === "lesson");
  $$("[data-nav]").forEach(b => b.classList.toggle("is-active", b.dataset.nav === name));
  if(name === "path") requestAnimationFrame(layoutAllTracks);
  if(name === "collection") renderCollection();
  window.scrollTo({ top:0, behavior:"auto" });
}

/* =========================================================
   6. BẢN ĐỒ BÀI HỌC
   ========================================================= */
const isUnlocked = lesson => lesson.gi === 0 || (state.done[ORDER[lesson.gi - 1].id] || 0) > 0;
const isDone = lesson => (state.done[lesson.id] || 0) > 0;
const currentLesson = () => ORDER.find(l => isUnlocked(l) && !isDone(l)) || ORDER[ORDER.length - 1];

function renderPath(){
  const main = $("#pathMain");
  main.innerHTML = "";
  const cur = currentLesson();
  const allDone = ORDER.every(isDone);

  const hero = document.createElement("div");
  hero.className = "hero";
  hero.innerHTML =
    '<div class="hero__mascot">' + mascotSVG() + '</div>' +
    '<div class="hero__txt">' +
      '<p class="eyebrow">' + (allDone ? "Con đã trồng xong cả khu vườn" : "Chào con, mình học tiếp nhé") + '</p>' +
      '<h1 class="scribble">' + (allDone ? "Học lại để từ không quên nhé!" : "Hôm nay gieo một hạt giống mới") + '</h1>' +
      '<p>' + (allDone ? "Cả " + ORDER.length + " bài đều đã xong." : "Bài tiếp theo: <b>" + cur.title + "</b> · Chặng " + (cur.unit.index + 1) + " " + cur.unit.emoji) + '</p>' +
    '</div>' +
    '<button class="btn" data-start="' + cur.id + '">' + (allDone ? "Ôn bài cuối" : "Bắt đầu học") + '</button>';
  main.appendChild(hero);
  const sb = hero.querySelector("[data-start]");
  if(sb) sb.addEventListener("click", () => { sfx("tap"); startLesson(cur.id); });

  UNITS.forEach(unit => {
    const doneCount = unit.lessons.filter(isDone).length;
    const banner = document.createElement("div");
    banner.className = "unit";
    banner.style.setProperty("--tint", unit.tint);
    banner.style.setProperty("--accent", unit.accent);
    banner.innerHTML =
      '<div class="unit__tape"></div>' +
      '<div class="unit__row">' +
        '<span class="unit__emoji">' + unit.emoji + '</span>' +
        '<div><p class="unit__kicker">Chặng ' + (unit.index + 1) + ' · ' + unit.lessons.length + ' bài</p>' +
        '<h2 class="unit__title">' + unit.title + '</h2></div>' +
        '<span class="unit__count">' + doneCount + '/' + unit.lessons.length + '</span>' +
      '</div>' +
      '<div class="unit__bar"><i style="width:' + (doneCount / unit.lessons.length * 100) + '%"></i></div>';
    main.appendChild(banner);

    const track = document.createElement("div");
    track.className = "track";
    main.appendChild(track);

    unit.lessons.forEach(lesson => {
      const done = isDone(lesson), open = isUnlocked(lesson), now = lesson.id === cur.id;
      const btn = document.createElement("button");
      btn.className = "node " + (done ? "node--done" : (open ? (now ? "node--now" : "") : "node--locked"));
      btn.dataset.lesson = lesson.id;
      btn.disabled = !open;
      btn.style.setProperty("--accent", unit.accent);
      btn.style.setProperty("--tint", unit.tint);
      const face = done ? icon("check") : (open ? '<span class="stamp">' + unit.emoji + '</span>' : icon("lock"));
      btn.innerHTML = '<span class="node__face">' + face + '</span>' +
                      '<span class="node__label">Bài ' + (lesson.idx + 1) + '</span>';
      btn.setAttribute("aria-label", unit.title + " — " + lesson.title + (done ? " (đã học)" : open ? " (bắt đầu)" : " (chưa mở)"));
      btn.addEventListener("click", () => { sfx("tap"); startLesson(lesson.id); });
      track.appendChild(btn);

      if(now){
        const m = document.createElement("div");
        m.className = "mascot";
        m.innerHTML = mascotSVG();
        track.appendChild(m);
      }
    });
  });

  requestAnimationFrame(() => {
    layoutAllTracks();
    const now = main.querySelector(".node--now");
    if(now){
      const box = now.getBoundingClientRect();
      if(box.top < 90 || box.bottom > window.innerHeight - 40){
        setTimeout(() => now.scrollIntoView({ block:"center", behavior:"smooth" }), 220);
      }
    }
  });
}

function layoutAllTracks(){
  $$("#pathMain .track").forEach(track => {
    const nodes = $$(".node", track);
    if(!nodes.length) return;
    const w = track.clientWidth || 600;
    const narrow = w < 520;
    const amp = narrow ? Math.min(46, w * 0.16) : Math.min(112, w * 0.21);
    const step = narrow ? 118 : 138;
    const cx = w / 2;
    const pts = nodes.map((_, i) => ({
      x: cx + Math.sin(i * 1.15 + 0.45) * amp,
      y: 52 + i * step
    }));
    const h = 52 + (nodes.length - 1) * step + 72;
    track.style.height = h + "px";

    let d = "M " + pts[0].x + " " + pts[0].y;
    for(let i=1;i<pts.length;i++){
      const a = pts[i-1], b = pts[i];
      d += " C " + a.x + " " + (a.y + step*0.45) + " " + b.x + " " + (b.y - step*0.45) + " " + b.x + " " + b.y;
    }
    const old = Array.prototype.find.call(track.children, c => c.tagName && c.tagName.toLowerCase() === "svg");
    if(old) old.remove();
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("class","track__vine");
    svg.setAttribute("width", w);
    svg.setAttribute("height", h);
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("aria-hidden","true");
    svg.innerHTML = '<path class="vine-base" d="' + d + '"></path><path class="vine-dash" d="' + d + '"></path>';
    track.insertBefore(svg, track.firstChild);

    nodes.forEach((n, i) => { n.style.left = pts[i].x + "px"; n.style.top = pts[i].y + "px"; });

    const m = track.querySelector(".mascot");
    if(m){
      const i = nodes.findIndex(n => n.classList.contains("node--now"));
      const p = pts[i < 0 ? 0 : i];
      const side = p.x < cx ? 1 : -1;
      m.style.left = (p.x + side * 66) + "px";
      m.style.top = p.y + "px";
    }
  });
}

/* =========================================================
   7. LUỒNG BÀI HỌC
   ========================================================= */
let run = null;
let runSeq = 0;

function startLesson(id){
  const lesson = LESSON_BY_ID(id);
  if(!lesson || !isUnlocked(lesson)) return;
  if(state.hearts <= 0){ openHearts(); return; }
  run = { token:++runSeq, lesson, qs:buildQuestions(lesson), i:0, correct:0, bad:0, answered:false, missed:[] };
  showScreen("lesson");
  renderSegs(); renderHearts(); renderQuestion();
}

function renderSegs(){
  const segs = $("#segs");
  segs.innerHTML = "";
  for(let i=0;i<run.qs.length;i++){
    const s = document.createElement("i");
    if(i < run.i) s.className = "is-on";
    if(run.missed.includes(i)) s.className = "is-bad";
    segs.appendChild(s);
  }
}
function renderHearts(){
  const box = $("#lessonHearts");
  let html = "";
  for(let i=0;i<state.maxHearts;i++) html += heartSVG(i < state.hearts);
  box.innerHTML = html;
}

function renderQuestion(){
  const q = run.qs[run.i];
  run.answered = false;
  $("#qPrompt").textContent = q.prompt;
  const stage = $("#qStage");
  const opts = $("#qOpts");
  opts.innerHTML = "";

  if(q.kind === "emoji"){
    stage.innerHTML = '<div class="stage__emoji">' + q.word.emoji + '</div>';
  } else if(q.kind === "vi"){
    stage.innerHTML = '<div class="stage__word">' + q.word.en + '</div>' +
      '<button class="speakbtn" type="button" data-say="' + q.word.en + '">🔊 Nghe phát âm</button>';
  } else if(q.kind === "listen"){
    stage.innerHTML = '<button class="bigspeak" type="button" data-say="' + q.word.en + '" aria-label="Nghe từ">🔊</button>' +
      '<p class="stage__hint">' + (state.sound ? "Bấm loa để nghe lại" : "Âm thanh đang tắt · gợi ý: " + q.word.vi) + '</p>';
  } else {
    stage.innerHTML = '<div class="stage__row"><span class="stage__emoji stage__emoji--sm">' + q.word.emoji + '</span>' +
      '<span class="spellword">' + q.masked + '</span></div>' +
      '<p class="stage__hint">Gợi ý: ' + q.word.vi + '</p>';
  }

  q.options.forEach((val, idx) => {
    const b = document.createElement("button");
    b.className = "opt";
    b.type = "button";
    b.dataset.val = val;
    b.innerHTML = '<span class="opt__key">' + (idx + 1) + '</span><span>' + val + '</span>';
    b.addEventListener("click", () => choose(b, val));
    opts.appendChild(b);
  });

  if(q.kind === "listen" || q.kind === "vi") setTimeout(() => speak(q.word.en), 220);
  const first = opts.querySelector(".opt");
  if(first) first.focus({ preventScroll:true });
}

function choose(btn, val){
  if(!run || run.answered) return;
  run.answered = true;
  const q = run.qs[run.i];
  const ok = val === q.answer;
  const buttons = $$("#qOpts .opt");

  buttons.forEach(b => {
    b.disabled = true;
    if(b.dataset.val === q.answer) b.classList.add("is-right");
  });
  if(!ok) btn.classList.add("is-wrong");
  else btn.classList.add("is-right");

  if(ok){
    run.correct++;
    sfx("ok");
    showFeedback(true, "Chính xác!", "“" + q.word.en + "” = " + q.word.vi);
  } else {
    run.bad++;
    run.missed.push(run.i);
    state.hearts = Math.max(0, state.hearts - 1);
    state.heartAt = Date.now();
    sfx("no");
    showFeedback(false, "Chưa đúng rồi.", "Đáp án đúng: " + q.answer + (q.kind === "spell" ? " (từ: " + q.word.en + ")" : ""));
    renderHearts();
    const lost = $$("#lessonHearts svg")[state.hearts];
    if(lost) lost.classList.add("is-lost");
    save();
  }
  paintChrome();
  renderSegs();

  const delay = ok ? 950 : 1800;
  const token = run.token;
  setTimeout(() => nextQuestion(token), delay);
}

function showFeedback(ok, title, sub){
  const fb = $("#feedback");
  fb.className = "feedback is-on " + (ok ? "feedback--ok" : "feedback--no");
  $("#fbIcon").innerHTML = icon(ok ? "check" : "x");
  $("#fbTxt").innerHTML = title + '<span class="feedback__sub">' + sub + '</span>';
}
function hideFeedback(){ $("#feedback").className = "feedback"; }

function nextQuestion(token){
  if(!run || (token !== undefined && token !== run.token)) return;
  hideFeedback();
  if(state.hearts <= 0){ openHearts(true); return; }
  run.i++;
  if(run.i >= run.qs.length){ finishLesson(); return; }
  renderSegs();
  renderQuestion();
}

function finishLesson(){
  const total = run.qs.length;
  const perfect = run.correct === total;
  const xpEarned = XP_BASE + run.correct * XP_PER_CORRECT;
  const lesson = run.lesson;

  state.totalXp += xpEarned;
  state.xp += xpEarned;
  state.leaves += perfect ? 15 : 8;
  state.done[lesson.id] = (state.done[lesson.id] || 0) + 1;

  /* chuỗi ngày */
  const today = todayStr();
  if(state.lastDay !== today){
    if(state.lastDay === yesterdayStr()) state.streak += 1;
    else if(state.shield && state.streak > 0){ state.shield = false; }
    else state.streak = 1;
    state.lastDay = today;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
  }

  /* XP hôm nay */
  if(state.todayDate !== today){ state.todayDate = today; state.todayXp = 0; }
  state.todayXp += xpEarned;

  /* lên cấp */
  const ups = [];
  let guard = 0;
  while(state.xp >= needXp(state.level) && guard++ < 50){
    state.xp -= needXp(state.level);
    state.level++;
    const flower = FLOWERS[(state.level - 2) % FLOWERS.length];
    state.garden.push(flower);
    ups.push({ level:state.level, title:titleOf(state.level), flower });
  }

  save();
  paintChrome();
  renderPath();
  renderResult({ xpEarned, correct:run.correct, total, perfect, ups, lesson });
  showScreen("result");
  sfx("coin");
  if(ups.length){ setTimeout(() => openLevelUp(ups[ups.length - 1]), 420); confetti(); }
  else if(perfect) confetti(60);
  run = null;
}

/* =========================================================
   8. KẾT QUẢ
   ========================================================= */
function renderResult(r){
  const acc = Math.round(r.correct / r.total * 100);
  const need = needXp(state.level);
  const pct = Math.min(100, Math.round(state.xp / need * 100));
  const nextLesson = ORDER.find(l => isUnlocked(l) && !isDone(l));

  $("#screen-result").innerHTML =
    '<div class="result">' +
      '<div class="result__badge">' + (r.perfect ? icon("star") : flowerSVG(r.total)) + '</div>' +
      '<h2>' + (r.perfect ? "Hoàn hảo!" : "Xong bài rồi!") + '</h2>' +
      '<p class="result__sub">' + r.lesson.title + ' · ' + r.lesson.unit.title + '</p>' +
      '<div class="stats">' +
        '<div class="stat stat--xp"><b>+' + r.xpEarned + '</b><span>XP</span></div>' +
        '<div class="stat stat--acc"><b>' + acc + '%</b><span>Chính xác</span></div>' +
        '<div class="stat stat--streak"><b>' + state.streak + ' ' + icon("flame") + '</b><span>Chuỗi ngày</span></div>' +
      '</div>' +
      '<div class="xpbar">' +
        '<div class="xpbar__top"><span>Cấp ' + state.level + ' · ' + titleOf(state.level) + '</span>' +
        '<span>' + state.xp + ' / ' + need + ' XP</span></div>' +
        '<div class="xpbar__track"><i style="width:' + pct + '%"></i></div>' +
      '</div>' +
      '<div class="actions">' +
        (nextLesson
          ? '<button class="btn btn--wide" data-act="next">Học bài tiếp theo →</button>'
          : '<button class="btn btn--wide" data-act="path">Về vườn xem thành quả</button>') +
        '<button class="btn btn--ghost btn--wide" data-act="path">Về vườn</button>' +
      '</div>' +
    '</div>';

  $$("#screen-result [data-act]").forEach(b => {
    b.addEventListener("click", () => {
      if(b.dataset.act === "next" && nextLesson) startLesson(nextLesson.id);
      else { showScreen("path"); renderPath(); }
    });
  });
}

/* =========================================================
   9. OVERLAY: LÊN CẤP / HẾT TIM / CHỢ LÁ
   ========================================================= */
const overlay = $("#overlay");
function openOverlay(html, accent){
  overlay.innerHTML = '<div class="modal">' +
    '<span class="doodles">' + doodleSVG() + '</span>' + html + '</div>';
  if(accent) overlay.firstChild.style.setProperty("--accent", accent);
  overlay.classList.add("is-on");
  const btn = overlay.querySelector(".btn");
  if(btn) btn.focus({ preventScroll:true });
}
function closeOverlay(){ overlay.classList.remove("is-on"); overlay.innerHTML = ""; }
overlay.addEventListener("click", e => {
  if(e.target === overlay) closeOverlay();
});
document.addEventListener("keydown", e => {
  if(e.key === "Escape" && overlay.classList.contains("is-on")) closeOverlay();
});

function openLevelUp(u){
  sfx("level");
  confetti(90);
  openOverlay(
    '<div class="modal__burst">' + burstSVG() + '</div>' +
    '<h2>Lên cấp!</h2>' +
    '<div class="lvlbig">' + u.level + '</div>' +
    '<p>Con vừa trở thành <b>' + u.title + '</b>.<br>Một bông hoa mới đã mọc trong khay vườn.</p>' +
    '<div class="modal__flower">' + flowerSVG(u.flower) + '</div>' +
    '<div class="modal__list"><button class="btn btn--sun btn--wide" data-close>Xem vườn của con</button></div>',
    "var(--sun)"
  );
  const b = overlay.querySelector("[data-close]");
  if(b) b.addEventListener("click", () => { closeOverlay(); showScreen("path"); renderPath(); });
}

function openHearts(fromLesson){
  const cost = 25;
  openOverlay(
    '<div class="modal__burst">' + icon("heart") + '</div>' +
    '<h2>Hết tim rồi</h2>' +
    '<p>Con nghỉ một chút nhé — cứ khoảng một phút tim lại hồi một nhịp.<br>Hoặc dùng lá để hồi ngay và học tiếp.</p>' +
    '<div class="modal__list">' +
      '<button class="btn btn--wide" data-refill ' + (state.leaves < cost ? "disabled" : "") + '>Hồi đầy tim · ' + cost + ' 🍃</button>' +
      '<button class="btn btn--ghost btn--wide" data-close>Về vườn ôn lại từ</button>' +
    '</div>',
    "var(--coral)"
  );
  const r = overlay.querySelector("[data-refill]");
  if(r) r.addEventListener("click", () => {
    if(state.leaves < cost) return;
    state.leaves -= cost; state.hearts = state.maxHearts; state.heartAt = Date.now();
    save(); paintChrome(); renderHearts(); closeOverlay(); sfx("coin");
    if(fromLesson && run){ nextQuestion(run.token); }
    else { showScreen("path"); renderPath(); }
  });
  overlay.querySelector("[data-close]").addEventListener("click", () => {
    closeOverlay();
    if(run){ run = null; }
    showScreen("path"); renderPath();
  });
}

const SHOP = [
  { id:"hearts", e:"❤️", name:"Hồi đầy tim", desc:"Đầy 5 tim để học tiếp", cost:25,
    run(){ state.hearts = state.maxHearts; state.heartAt = Date.now(); } },
  { id:"seed", e:"🌷", name:"Hạt giống hoa", desc:"Trồng thêm một bông vào khay vườn", cost:40,
    run(){ state.garden.push(pick(FLOWERS)); } },
  { id:"shield", e:"🛡️", name:"Bùa giữ chuỗi", desc:"Nghỉ một ngày mà không mất chuỗi", cost:60,
    run(){ state.shield = true; } }
];

function openShop(){
  openOverlay(
    '<h2>Chợ lá</h2>' +
    '<p>Con đang có <b>' + state.leaves + ' 🍃</b>. Lá kiếm được khi hoàn thành bài học.</p>' +
    '<div class="modal__list">' +
      SHOP.map(it =>
        '<div class="shopitem">' +
          '<span class="shopitem__e">' + it.e + '</span>' +
          '<span class="shopitem__t"><b>' + it.name + '</b><span>' + it.desc + '</span></span>' +
          '<button class="btn" data-buy="' + it.id + '" ' + (state.leaves < it.cost ? "disabled" : "") + '>' + it.cost + ' 🍃</button>' +
        '</div>').join("") +
      '<button class="btn btn--ghost btn--wide" data-close>Đóng</button>' +
    '</div>',
    "var(--sky)"
  );
  overlay.querySelector("[data-close]").addEventListener("click", closeOverlay);
  $$("[data-buy]", overlay).forEach(b => {
    b.addEventListener("click", () => {
      const item = SHOP.find(x => x.id === b.dataset.buy);
      if(!item || state.leaves < item.cost) return;
      state.leaves -= item.cost;
      item.run();
      save(); paintChrome(); sfx("coin"); renderPath();
      openShop();
    });
  });
}

/* =========================================================
   10. SỔ TỪ
   ========================================================= */
function renderCollection(){
  const learned = new Set();
  ORDER.forEach(l => { if(isDone(l)) l.words.forEach(w => learned.add(w.en)); });

  $("#collLevel").textContent = state.level;
  $("#collTitle").textContent = titleOf(state.level);
  $("#collSub").textContent = "Đã trồng " + learned.size + "/" + ALL_WORDS.length + " từ · " +
    state.totalXp + " XP tổng · chuỗi dài nhất " + state.bestStreak + " ngày";

  const lessonsDone = ORDER.filter(isDone).length;
  const badges = [
    { e:"🌱", label:"Bài đầu tiên", on: lessonsDone >= 1 },
    { e:"📚", label:"5 bài học", on: lessonsDone >= 5 },
    { e:"🔥", label:"Chuỗi 3 ngày", on: state.bestStreak >= 3 },
    { e:"⭐", label:"Cấp 5", on: state.level >= 5 },
    { e:"🌻", label:"10 bông hoa", on: state.garden.length >= 10 },
    { e:"🏆", label:"Học hết 6 chặng", on: lessonsDone >= ORDER.length }
  ];
  $("#badges").innerHTML = badges.map(b =>
    '<span class="badge ' + (b.on ? "is-earned" : "") + '"><i>' + b.e + '</i>' + b.label + '</span>'
  ).join("");

  $("#wordgrid").innerHTML = ALL_WORDS.map(w => {
    const got = learned.has(w.en);
    return '<div class="word ' + (got ? "" : "word--locked") + '">' +
      '<span class="word__e">' + (got ? w.emoji : "🔒") + '</span>' +
      '<span class="word__en">' + (got ? w.en : "· · ·") + '</span>' +
      '<span class="word__vi">' + (got ? w.vi : "Chưa học") + '</span>' +
      (got ? '<button class="word__say" type="button" data-say="' + w.en + '">🔊 Nghe</button>' : "") +
    '</div>';
  }).join("");
}

/* =========================================================
   11. CONFETTI
   ========================================================= */
const cvs = $("#confetti");
function confetti(count){
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = cvs.getContext("2d");
  if(!ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cvs.width = innerWidth * dpr; cvs.height = innerHeight * dpr;
  cvs.style.display = "block";
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const colors = ["#F2A93B","#EC6A4F","#4F9E62","#4E9CD3","#8172CF","#E56C9B","#2B2B2B"];
  const parts = [];
  const n = count || 110;
  for(let i=0;i<n;i++){
    parts.push({
      x: innerWidth * (0.2 + Math.random()*0.6),
      y: innerHeight * 0.32 + Math.random()*40,
      vx: (Math.random()-0.5)*7,
      vy: -Math.random()*9 - 3,
      s: 5 + Math.random()*7,
      r: Math.random()*Math.PI,
      vr: (Math.random()-0.5)*0.3,
      c: colors[Math.floor(Math.random()*colors.length)],
      life: 1
    });
  }
  const start = performance.now();
  function frame(t){
    const dt = Math.min(2, (t - start) / 16.67);
    ctx.clearRect(0,0,innerWidth,innerHeight);
    let alive = 0;
    parts.forEach(p => {
      p.vy += 0.34 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      if(p.y < innerHeight + 40){ alive++; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.globalAlpha = 0.95;
      ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s * 0.62);
      ctx.restore();
    });
    if(alive > 0 && t - start < 3200){ requestAnimationFrame(frame); }
    else { ctx.clearRect(0,0,innerWidth,innerHeight); cvs.style.display = "none"; }
  }
  requestAnimationFrame(frame);
}

/* =========================================================
   12. GẮN SỰ KIỆN
   ========================================================= */
$$("[data-nav]").forEach(b => b.addEventListener("click", () => {
  const nav = b.dataset.nav;
  sfx("tap");
  if(nav === "shop"){ openShop(); return; }
  if(run){ run = null; hideFeedback(); }
  showScreen(nav);
  if(nav === "path") renderPath();
}));

$("#soundBtn").addEventListener("click", () => {
  state.sound = !state.sound;
  save(); paintChrome();
  if(state.sound) sfx("tap");
});

$("#quitLesson").addEventListener("click", () => {
  hideFeedback();
  if(run) { run = null; }
  showScreen("path"); renderPath();
});

$("#resetBtn").addEventListener("click", () => {
  openOverlay(
    '<h2>Bắt đầu lại?</h2>' +
    '<p>Cấp, XP, chuỗi ngày và hoa trong vườn sẽ được trồng lại từ đầu. Những từ con đã học thì vẫn ở trong đầu con mà.</p>' +
    '<div class="modal__list">' +
      '<button class="btn btn--wide" data-reset>Xoá tiến độ</button>' +
      '<button class="btn btn--ghost btn--wide" data-close>Giữ lại</button>' +
    '</div>'
  );
  overlay.querySelector("[data-reset]").addEventListener("click", () => {
    state = freshState();
    save(); closeOverlay();
    paintChrome(); renderPath(); renderCollection();
    showScreen("path");
  });
  overlay.querySelector("[data-close]").addEventListener("click", closeOverlay);
});

document.addEventListener("click", e => {
  const s = e.target.closest("[data-say]");
  if(s){ speak(s.dataset.say); }
});

document.addEventListener("keydown", e => {
  if(!$("#screen-lesson").classList.contains("is-on") || !run || run.answered) return;
  const n = parseInt(e.key, 10);
  if(n >= 1 && n <= 4){
    const b = $$("#qOpts .opt")[n-1];
    if(b) b.click();
  }
  if(e.key === " " && run.qs[run.i] && (run.qs[run.i].kind === "listen")){
    e.preventDefault(); speak(run.qs[run.i].word.en);
  }
});

let rt = null;
window.addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => { if($("#screen-path").classList.contains("is-on")) layoutAllTracks(); }, 160);
});

/* =========================================================
   13. KHỞI ĐỘNG
   ========================================================= */
(function boot(){
  $$("[data-icon]").forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  $$("[data-doodle]").forEach(el => { el.innerHTML = doodleSVG(); });
  if(state.lastDay && state.lastDay !== todayStr() && state.lastDay !== yesterdayStr() && !state.shield && state.streak > 0){
    state.streak = 0;
  }
  if(state.todayDate !== todayStr()){ state.todayDate = todayStr(); state.todayXp = 0; }
  if(state.hearts < state.maxHearts && !state.heartAt) state.heartAt = Date.now();
  save();
  paintChrome();
  renderPath();
  renderCollection();
  setInterval(tickHearts, 5000);
  if("speechSynthesis" in window){
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
})();

/* PWA: đăng ký service worker (chỉ có tác dụng khi chạy qua https hoặc localhost) */
if("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")){
  window.addEventListener("load", () => { navigator.serviceWorker.register("./sw.js").catch(() => {}); });
}
