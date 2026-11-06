/* ---- âm thanh ---- */
let actx = null, master = null, noiseBuf = null, lastSfx = 0, sfxCount = 0;
function audio(){
  if(!actx){
    try{
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = 0.85;
      master.connect(actx.destination);
    }catch(e){ actx = null; }
  }
  if(actx && actx.state === "suspended"){ try{ actx.resume(); }catch(e){} }
  return actx;
}
function tone(freq, start, dur, type, vol, glide){
  const ctx = audio(); if(!ctx) return;
  const t = ctx.currentTime + (start || 0);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(freq, t);
  if(glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0003, vol || 0.08), t + Math.min(0.025, dur * 0.35));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master || ctx.destination);
  o.start(t); o.stop(t + dur + 0.04);
}
/* tiếng "tạch" của đầu bút chì trên giấy */
function pencilTick(start, vol){
  const ctx = audio(); if(!ctx) return;
  if(!noiseBuf){
    const len = Math.floor(ctx.sampleRate * 0.09);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/len, 2.2);
  }
  const t = ctx.currentTime + (start || 0);
  const s = ctx.createBufferSource(); s.buffer = noiseBuf;
  const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2600; f.Q.value = 1.1;
  const g = ctx.createGain(); g.gain.value = vol || 0.14;
  s.connect(f); f.connect(g); g.connect(master || ctx.destination);
  s.start(t);
}
function sfx(kind){
  if(!state.sound) return;
  lastSfx = performance.now();
  sfxCount++;
  if(kind === "ok"){
    pencilTick(0, 0.10);
    tone(1046.5, 0, 0.13, "triangle", 0.10);
    tone(1568.0, 0.085, 0.17, "triangle", 0.085);
    tone(2093.0, 0.165, 0.22, "sine", 0.045);
  } else if(kind === "no"){
    pencilTick(0, 0.09);
    tone(311.1, 0, 0.16, "triangle", 0.10, 233.1);
    tone(196.0, 0.13, 0.24, "triangle", 0.085);
  } else if(kind === "level"){
    [523.3, 659.3, 784.0, 1046.5, 1318.5].forEach((f, i) => tone(f, i*0.085, 0.32, "triangle", 0.085));
    pencilTick(0.44, 0.06);
    tone(2093.0, 0.44, 0.55, "sine", 0.04);
    tone(1568.0, 0.50, 0.60, "sine", 0.035);
  } else if(kind === "coin"){
    tone(1174.7, 0, 0.07, "square", 0.045);
    tone(1568.0, 0.06, 0.12, "square", 0.04);
  } else if(kind === "pop"){
    tone(880, 0, 0.07, "sine", 0.06, 1320);
  } else {
    pencilTick(0, 0.06);
    tone(760, 0, 0.05, "sine", 0.035);
  }
}
/* mọi nút / lựa chọn trên trang đều kêu "tạch" nhẹ */
document.addEventListener("click", e => { e.__s0 = sfxCount; }, true);   /* trước khi handler chạy */
document.addEventListener("click", e => {
  const t = e.target;
  if(!t || !t.closest) return;
  if(!t.closest("button, a, [role='button'], .opt, .node, .word, .badge, .shopitem")) return;
  if(e.__s0 !== undefined && e.__s0 !== sfxCount) return;   /* phần tử đã có âm riêng */
  sfx("tap");
});
function speak(text, rate){
  if(!("speechSynthesis" in window)) return;
  try{
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US"; u.rate = rate || 0.85; u.pitch = 1.15;
    const v = speechSynthesis.getVoices().find(x => /en-US|en_GB|en-GB/i.test(x.lang) && /female|samantha|zira|google/i.test(x.name))
           || speechSynthesis.getVoices().find(x => /^en/i.test(x.lang));
    if(v) u.voice = v;
    speechSynthesis.speak(u);
  }catch(e){}
}
