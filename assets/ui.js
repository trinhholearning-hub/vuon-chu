/* ---- bộ icon vẽ tay ---- */
const ICON = {
  home:'<path d="M3.6 11.4 12 4.2l8.4 7.2"/><path d="M5.9 10.6v8.6c0 .5.4.9.9.9h10.4c.5 0 .9-.4.9-.9v-8.6"/><path d="M9.8 20v-5h4.4v5"/>',
  book:'<path d="M11.4 6.6C10 5.4 7.9 4.9 4.8 5v12.6c3.1-.1 5.2.4 6.6 1.6 1.4-1.2 3.5-1.7 6.6-1.6V5c-3.1-.1-5.2.4-6.6 1.6z"/><path d="M11.4 6.6v12.6"/>',
  bag:'<path d="M5.4 8.4h13.2l-.9 10.2c-.1.7-.7 1.2-1.4 1.2H7.7c-.7 0-1.3-.5-1.4-1.2z"/><path d="M9.2 8.4V7a2.8 2.8 0 0 1 5.6 0v1.4"/>',
  sprout:'<path d="M12 20.6v-7.2"/><path d="M12 13.4c0-3.1-2-5-5.2-5-.3 3 1.7 5 5.2 5z"/><path d="M12 13.4c.3-3 2.4-4.6 5.4-4.4.2 3-1.8 4.6-5.4 4.4z"/><path d="M8.6 20.6h6.8"/>',
  flame:'<path d="M12 3.4c.5 2.8-2 4.2-2 6.3 0 1.1.8 1.9 1.8 1.9 1.3 0 1.9-1.2 1.6-2.4 1.8 1.2 3 3.3 3 5.5a6.4 6.4 0 0 1-12.8 0c0-3.9 3.3-6.1 8.4-11.3z"/>',
  leaf:'<path d="M19.4 4.6c-6.9 0-11.8 2.6-11.8 8.1 0 2.5 1.6 4.2 3.9 4.2 4.3 0 7.9-5 7.9-12.3z"/><path d="M5 19.6c1.2-4.5 3.9-8 8.4-10.2"/>',
  bolt:'<path d="M13.6 3.2 6.4 13.4h4.3L10 20.8l7.4-10.6h-4.5z"/>',
  heart:'<path d="M12 19.8C9.2 17.9 4.9 14.8 4.9 11a3.8 3.8 0 0 1 7.1-2.1A3.8 3.8 0 0 1 19.1 11c0 3.8-4.3 6.9-7.1 8.8z"/>',
  check:'<path d="M4.6 12.9 9.6 17.8 19.6 6.4"/>',
  x:'<path d="M6.4 6.4l11.2 11.2M17.6 6.4 6.4 17.6"/>',
  lock:'<rect x="5.6" y="10.2" width="12.8" height="9.4" rx="1.6"/><path d="M8.6 10.2V7.9a3.4 3.4 0 0 1 6.8 0v2.3"/>',
  speaker:'<path d="M4.4 9.4h3.2L12 5.6v12.8L7.6 14.6H4.4z"/><path d="M15.4 9.1a3.9 3.9 0 0 1 0 5.8"/><path d="M17.9 6.6a7.3 7.3 0 0 1 0 10.8"/>',
  speakerOff:'<path d="M4.4 9.4h3.2L12 5.6v12.8L7.6 14.6H4.4z"/><path d="M15.6 9.6l4.2 4.8M19.8 9.6l-4.2 4.8"/>',
  star:'<path d="M12 3.6l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8z"/>'
};
function icon(name){
  return '<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICON[name] || '') + '</svg>';
}
function heartSVG(alive){
  return '<svg viewBox="0 0 24 24" fill="' + (alive ? 'rgba(176,82,74,.55)' : 'none') +
    '" stroke="' + (alive ? '#8E3F38' : '#A6A29A') + '" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">' +
    ICON.heart + '</svg>';
}
function flowerSVG(seed){
  let s = Number(seed);
  if(!isFinite(s)) s = 0;
  s = Math.abs(Math.floor(s));
  const petals = 5 + (s % 3);
  let p = '';
  for(let i=0;i<petals;i++){
    p += '<ellipse cx="20" cy="10.8" rx="4.3" ry="7" transform="rotate(' + ((360/petals)*i).toFixed(1) + ' 20 19)"/>';
  }
  return '<svg viewBox="0 0 40 58" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M20 55V33"/>' +
    '<path d="M20 47c-5.4 0-8.4-2.4-8.4-6.2 4.6-.6 8.4 1.6 8.4 6.2z"/>' +
    p +
    '<circle cx="20" cy="19" r="3.4"/>' +
    '</svg>';
}
function doodleSVG(){
  return '<svg viewBox="0 0 62 62" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M11 5.5v9.4M6.3 10.2h9.4" stroke="#F2A93B" stroke-width="2.1"/>' +
    '<path d="M43 3.4l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z" stroke="#E56C9B" stroke-width="1.5"/>' +
    '<path d="M8 44c5.4-6.4 10.8-6.4 16.2 0s10.8 6.4 16.2 0" stroke="#4E9CD3" stroke-width="1.9"/>' +
    '<circle cx="52" cy="31" r="2.4" stroke="#8172CF" stroke-width="1.6"/>' +
    '<path d="M26 55.5l1.8 3.6 3.9.5-2.8 2.7.7 3.9-3.6-1.9-3.6 1.9.7-3.9-2.8-2.7 3.9-.5z" stroke="#4F9E62" stroke-width="1.3"/>' +
    '</svg>';
}
function burstSVG(){
  let l = '';
  for(let i=0;i<12;i++){
    const a = (Math.PI*2/12)*i;
    l += '<path d="M' + (24+Math.cos(a)*13).toFixed(1) + ' ' + (24+Math.sin(a)*13).toFixed(1) +
         'L' + (24+Math.cos(a)*20.5).toFixed(1) + ' ' + (24+Math.sin(a)*20.5).toFixed(1) + '"/>';
  }
  return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' + l + '</svg>';
}

function mascotSVG(){
  return '<svg viewBox="0 0 100 120" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M31 113.6c4-1.4 11.6-2.2 19-2.2s15 .8 19 2.2" stroke-opacity=".3" stroke-width="1.5"/>' +
    '<path d="M33.4 86h33.2l-4.5 24.3c-.2 1.3-1.3 2.2-2.6 2.2H40.5c-1.3 0-2.4-.9-2.6-2.2z" fill="#F6F2E6"/>' +
    '<path d="M30.4 77.6h39.2v8.4H30.4z" fill="#F6F2E6"/>' +
    '<g stroke-opacity=".34" stroke-width="1.2"><path d="M39.4 92.4l-1.6 15.4M46.4 92.4l-1 18.6M53.6 92.4l1 18.6M60.6 92.4l1.6 15.4"/></g>' +
    '<path d="M50 77.6c0-8.6 0-12.4 0-15.4"/>' +
    '<path d="M50 68.2c-6.6-.2-10.8-3.4-10.8-8.6 5.8-.9 10.8 3 10.8 8.6z" fill="#F6F2E6"/>' +
    '<path d="M50 62.8c6.4-.5 10.4-3.9 10-9-5.9.2-10.2 4-10 9z" fill="#F6F2E6"/>' +
    '<circle cx="50" cy="40.4" r="18.4" fill="#F6F2E6"/>' +
    '<circle cx="43.4" cy="38.4" r="1.9" fill="#262626" stroke="none"/>' +
    '<circle cx="56.6" cy="38.4" r="1.9" fill="#262626" stroke="none"/>' +
    '<path d="M45.2 46.4c1.8 2.2 7.8 2.2 9.6 0"/>' +
    '<g stroke-opacity=".4" stroke-width="1.1"><path d="M35.2 43.6l2.6 1.8M37 42l2.4 2.2M64.8 43.6l-2.6 1.8M63 42l-2.4 2.2"/></g>' +
    '</svg>';
}
