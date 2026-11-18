(() => {
'use strict';
/* ---------- pixel sprites (drawn in code) ---------- */
const PAL = {k:'#07051a', o:'#ff9f43', p:'#ff7eb6', e:'#07051a', w:'#fff8e7', c:'#ff8fa3',
  b:'#8a5a2b', t:'#c98a4b', g:'#5ef26b', G:'#2fb84a', y:'#ffcc33', u:'#b07cff', l:'#e3c8ff', s:'#8fdcff',
  n:'#a0662f', m:'#cfd8ff', r:'#ff5a5a', i:'#cfd2e8', v:'#7b73c9'};
const SPR = {
 cat: { name:'Cat', base:[
  '.k........k.','kok......kok','kopokkkkopok','kooooooooook',
  'kowkoooowkok','kokkooookkok','kcoooppooock','kooookkooook','.kooooooook.',
  '.kowwwwwwok.','.kowwwwwwok.','.kookkkkook.','..kk....kk..'],
  blink:{4:'kooooooooook'} },
 dog: { name:'Dog', base:[
  '..kkkkkkkk..','.kttttttttk.','kbbttttttbbk','kbbttttttbbk','kbbwkttwkbbk','kbbkkttkkbbk',
  '.kbttkkttbk.','.kttttpptttk'.slice(0,12),'..kttttttk..','.ktwwwwwwtk.','.ktwwwwwwtk.','.kttkkkkttk.','..kk....kk..'],
  blink:{4:'kbbttttttbbk',5:'kbbkkttkkbbk'} },
 alien: { name:'Zib', base:[
  '.....yy.....','.....yy.....','......k.....','...kkkkkk...','..kggggggk..','.kggggggggk.',
  'kgwkggggwkgk','kgkkggggkkgk','kggggggggggk','.kgggkkgggk.','..kggggggk..','..kGkGGkGk..','..k.k..k.k..'],
  blink:{6:'kggggggggggk',7:'kgkkggggkkgk'} },
 blob: { name:'Bloop', base:[
  '............','....kkkk....','..kkuuuukk..','.kullluuuuk.','kuluuuuuuuuk','kuuwkuuwkuuk',
  'kuukkuukkuuk','kcuuukkuuuck','kuuuuuuuuuuk','kuuuuuuuuuuk','.kuuuuuuuuk.','..kkkkkkkk..','............'],
  blink:{5:'kuuuuuuuuuuk',6:'kuukkuukkuuk'} },
 bot: { name:'Bleep', base:[
  '.....r......','.....k......','..kkkkkkkk..','.kiiiiiiiik.','.kikkkkkkik.','.kiksskssik.',
  '.kikkkkkkik.','.kiiiiiiiik.','kkiivvvviikk','kikiiiiiikik','..kiiiiiik..','..kvk..kvk..','..kk....kk..'],
  blink:{5:'.kikkkkkkik.'} }
};
const MOP = ['..n...','..n...','..n...','..n...','..n...','..n...','..n...','..n...','.kkkk.','kmmmmk','kmimimk'.slice(0,6),'mimimi','imimim','m.i.m.'];
const PETS = Object.keys(SPR);
const cache = {};
function draw(rows, scale = 1) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d');
  rows.forEach((r, j) => [...r].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i, j, 1, 1); } }));
  return cv.toDataURL();
}
function petSrc(pet, blink) {
  const key = pet + (blink ? ':b' : '');
  if (!cache[key]) {
    const s = SPR[pet] || SPR.cat; let rows = s.base.slice();
    if (blink) for (const [i, r] of Object.entries(s.blink)) rows[i] = r;
    cache[key] = draw(rows);
  }
  return cache[key];
}
const mopSrc = draw(MOP);

/* ---------- data ---------- */
const KEY = 'mukker-tasks-v2';
const COLORS = ['#ffcc33', '#5ef2b0', '#ff7eb6', '#6fd3ff', '#b07cff', '#ff9f43'];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
let state;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch (e) { state = null; }
if (!state || !Array.isArray(state.folders)) {
  state = { folders: [
    { id: uid(), name: 'Health', pet: 'cat', color: '#5ef2b0', open: true, tasks: [
      { id: uid(), text: 'Drink 8 glasses of water', done: false },
      { id: uid(), text: '20 min walk after shift', done: false }] },
    { id: uid(), name: 'Money', pet: 'dog', color: '#ffcc33', open: true, tasks: [
      { id: uid(), text: 'Check this week\u2019s budget', done: false }] }
  ], doneLog: {} };
}
state.doneLog = state.doneLog || {};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const todayKey = () => new Date().toISOString().slice(0, 10);

const MSGS = ['Squeaky clean! One down \u2728', 'Nice! The Mukkerverse is proud of you.', 'Tiny step, big orbit. Keep going!',
  'Mopped it! What\u2019s next, captain?', 'You showed up. That\u2019s the win.', 'Boom! Momentum unlocked \uD83D\uDE80',
  'Done is better than perfect.', 'Look at you go! \u2b50', 'Another star lit up in your galaxy.', 'Small wins stack up. Stack \u2019em!',
  'Brave move. Next one\u2019s easier.', 'Clean deck, clear mind.', 'Purr-fect work! \uD83D\uDC3E', 'Level up! +1 XP',
  'Progress over pressure.', 'You\u2019re building something real.', 'Woof! Do another and I\u2019ll do a flip.', 'Beep boop: excellence detected.'];
let msgI = Math.floor(Math.random() * MSGS.length);
const nextMsg = () => MSGS[(msgI++) % MSGS.length];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- render ---------- */
const $ = s => document.querySelector(s);
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const list = $('#folders');
function taskHTML(t) {
  return `<li class="task${t.done ? ' done' : ''}" data-tid="${t.id}">
    <button class="tick" data-act="toggle" aria-label="${t.done ? 'Mark not done' : 'Complete'}: ${esc(t.text)}"></button>
    <span class="ttext">${esc(t.text)}</span>
    <button class="del" data-act="deltask" aria-label="Delete task">\u2715</button></li>`;
}
function render(focusFid) {
  list.innerHTML = state.folders.map((f, i) => {
    const open = f.tasks.filter(t => !t.done), done = f.tasks.filter(t => t.done);
    return `<article class="folder${f.open ? ' open' : ''}" data-fid="${f.id}" style="--acc:${f.color}">
      <button class="perch" data-act="pet" aria-label="${SPR[f.pet] ? SPR[f.pet].name : 'Pet'}"><img class="px pet" data-pet="${f.pet}" src="${petSrc(f.pet)}" alt=""></button>
      <button class="fhead" data-act="fold" aria-expanded="${f.open}">
        <span class="chev">\u25B6</span><span class="fname"><b>${i + 1}.</b> ${esc(f.name)}</span>
        <span class="count">${done.length}/${f.tasks.length}</span></button>
      <button class="menu" data-act="menu" aria-label="Folder options">\u22EF</button>
      <div class="fbody">
        ${open.length ? `<ul class="tasks">${open.map(taskHTML).join('')}</ul>` : `<p class="empty">${f.tasks.length ? 'All clean! Add something new.' : 'No tasks yet. Add your first one \u2193'}</p>`}
        <form class="add" data-act="add"><input name="t" placeholder="Add a task\u2026" enterkeyhint="done" maxlength="200" aria-label="New task in ${esc(f.name)}"><button aria-label="Add task">+</button></form>
        ${done.length ? `<details class="donebox"${f.showDone ? ' open' : ''}><summary>\u2714 Done (${done.length})</summary><ul class="tasks">${done.map(taskHTML).join('')}</ul>
          <button class="clear" data-act="cleardone">Clear done</button></details>` : ''}
      </div></article>`;
  }).join('') || '<p class="empty" style="text-align:center">No folders. Tap + NEW FOLDER to start.</p>';
  list.querySelectorAll('details').forEach(d => d.addEventListener('toggle', () => {
    const f = folderOf(d); if (f) { f.showDone = d.open; save(); } }));
  if (focusFid) { const inp = list.querySelector(`[data-fid="${focusFid}"] .add input`); inp && inp.focus({ preventScroll: true }); }
  stats();
}
function stats() {
  const all = state.folders.flatMap(f => f.tasks), d = all.filter(t => t.done).length;
  $('#meterFill').style.width = all.length ? (d / all.length * 100) + '%' : '0%';
  const n = state.doneLog[todayKey()] || 0;
  $('#today').textContent = n ? `${n} task${n > 1 ? 's' : ''} mopped today \u2728` : 'Let\u2019s get moving \u2726';
}
const folderOf = el => { const a = el.closest('[data-fid]'); return a && state.folders.find(f => f.id === a.dataset.fid); };

/* ---------- toast ---------- */
let toastT;
function toast(msg, pet) {
  const t = $('#toast'); t.hidden = true; void t.offsetWidth;
  t.querySelector('img').src = petSrc(pet || 'cat'); t.querySelector('p').textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 2800);
}
$('#toast').addEventListener('click', () => ($('#toast').hidden = true));

/* ---------- complete with mop ---------- */
function complete(f, t, li) {
  if (li.classList.contains('mopping')) return;
  li.classList.add('mopping', 'done');
  const dur = reduced ? 150 : 1500;
  if (!reduced) {
    const sw = document.createElement('div'); sw.className = 'sweep';
    sw.innerHTML = `<div class="wipe"></div><div class="bubbles"></div><div class="runner"><img class="px rp" src="${petSrc(f.pet)}" alt=""><img class="px mop" src="${mopSrc}" alt=""></div>`;
    li.appendChild(sw);
    const b = sw.querySelector('.bubbles');
    for (let i = 0; i < 7; i++) setTimeout(() => {
      const e = document.createElement('i'); e.style.left = (8 + i * 13) + '%'; b.appendChild(e); }, i * 190);
  }
  setTimeout(() => {
    t.done = true; t.doneAt = Date.now();
    state.doneLog[todayKey()] = (state.doneLog[todayKey()] || 0) + 1;
    save(); render(); toast(nextMsg(), f.pet);
    const p = list.querySelector(`[data-fid="${f.id}"] .perch`); p && hop(p);
  }, dur);
}
function hop(p) { p.classList.remove('hop'); void p.offsetWidth; p.classList.add('hop'); setTimeout(() => p.classList.remove('hop'), 600); }

/* ---------- events ---------- */
list.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'FORM') return;
  const f = folderOf(b); if (!f) return;
  const li = b.closest('.task'), t = li && f.tasks.find(x => x.id === li.dataset.tid);
  switch (b.dataset.act) {
    case 'fold': f.open = !f.open; save(); render(); break;
    case 'toggle': if (!t) break;
      if (t.done) { t.done = false; save(); render(); } else complete(f, t, li); break;
    case 'deltask': if (!t) break;
      f.tasks = f.tasks.filter(x => x !== t); save(); render(); break;
    case 'cleardone': f.tasks = f.tasks.filter(x => !x.done); save(); render(); break;
    case 'pet': hop(b); toast(nextMsg(), f.pet); break;
    case 'menu': folderMenu(f); break;
  }
});
list.addEventListener('submit', e => {
  e.preventDefault(); const f = folderOf(e.target); const v = e.target.t.value.trim(); if (!f || !v) return;
  f.tasks.push({ id: uid(), text: v, done: false }); save(); render(f.id);
});

/* ---------- sheets ---------- */
const sheet = $('#sheet'); let onOk = null;
function openSheet(title, body, okText, ok, danger) {
  $('#sheetTitle').textContent = title; $('#sheetBody').innerHTML = body;
  const okb = $('#sheetOk'); okb.textContent = okText; okb.className = 'btn ' + (danger ? 'danger' : 'gold');
  onOk = ok; sheet.hidden = false;
  const inp = sheet.querySelector('.field'); if (inp) setTimeout(() => inp.focus(), 60);
}
const closeSheet = () => { sheet.hidden = true; onOk = null; };
sheet.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeSheet(); });
$('#sheetForm').addEventListener('submit', e => { e.preventDefault(); if (onOk && onOk(new FormData(e.target)) !== false) closeSheet(); });
function folderForm(f) {
  const pet = f ? f.pet : PETS[state.folders.length % PETS.length], col = f ? f.color : COLORS[state.folders.length % COLORS.length];
  return `<input class="field" name="name" maxlength="40" placeholder="Folder name (e.g. Trading)" value="${f ? esc(f.name) : ''}" aria-label="Folder name">
   <span class="lbl">PICK A PET</span><div class="pets">${PETS.map(p =>
    `<label><input type="radio" name="pet" value="${p}"${p === pet ? ' checked' : ''}><img class="px" src="${petSrc(p)}" alt="">${SPR[p].name}</label>`).join('')}</div>
   <span class="lbl">COLOUR</span><div class="colors">${COLORS.map(c =>
    `<label style="background:${c}"><input type="radio" name="color" value="${c}"${c === col ? ' checked' : ''} aria-label="colour ${c}"></label>`).join('')}</div>`;
}
$('#addFolderBtn').addEventListener('click', () => openSheet('New folder', folderForm(null), 'Create', fd => {
  const name = (fd.get('name') || '').trim(); if (!name) { sheet.querySelector('.field').focus(); return false; }
  state.folders.push({ id: uid(), name, pet: fd.get('pet') || 'cat', color: fd.get('color') || COLORS[0], open: true, tasks: [] });
  save(); render(); toast(`New folder "${name}" is ready!`, fd.get('pet'));
  setTimeout(() => list.lastElementChild && list.lastElementChild.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }), 50);
}));
function folderMenu(f) {
  openSheet(`Edit \u201C${f.name}\u201D`, folderForm(f) +
    `<button type="button" class="btn danger" id="delFolder" style="width:100%;margin-top:18px">\uD83D\uDDD1 Delete folder</button>`, 'Save', fd => {
    const name = (fd.get('name') || '').trim(); if (!name) return false;
    f.name = name; f.pet = fd.get('pet') || f.pet; f.color = fd.get('color') || f.color; save(); render();
  });
  $('#delFolder').addEventListener('click', () => {
    const n = f.tasks.length;
    openSheet('Delete folder?', `<p>Delete <b style="color:var(--ink)">${esc(f.name)}</b> and its ${n} task${n === 1 ? '' : 's'}? This can\u2019t be undone.</p>`, 'Delete', () => {
      state.folders = state.folders.filter(x => x !== f); save(); render();
    }, true);
  });
}

/* ---------- header: date, clock, calendar ---------- */
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function tick() {
  const d = new Date();
  $('#dateTxt').textContent = `${DOW[d.getDay()]} ${MON[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
  let h = d.getHours(); const ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12;
  const p = n => String(n).padStart(2, '0');
  $('#clock').textContent = `${h}:${p(d.getMinutes())}:${p(d.getSeconds())} ${ap}`;
}
tick(); setInterval(tick, 1000);
let calY, calM;
function renderCal() {
  const now = new Date(), first = new Date(calY, calM, 1).getDay(), days = new Date(calY, calM + 1, 0).getDate();
  $('#calTitle').textContent = `${MON[calM]} ${calY}`;
  let h = DOW.map(d => `<div class="dow">${d[0]}</div>`).join('');
  for (let i = 0; i < first; i++) h += '<div class="d blank"></div>';
  for (let d = 1; d <= days; d++) {
    const isNow = d === now.getDate() && calM === now.getMonth() && calY === now.getFullYear();
    const wd = (first + d - 1) % 7;
    h += `<div class="d${isNow ? ' now' : ''}${wd === 0 || wd === 6 ? ' wk' : ''}"${isNow ? ' aria-current="date"' : ''}>${d}</div>`;
  }
  $('#calGrid').innerHTML = h;
}
const cal = $('#cal');
const calToday = () => { const n = new Date(); calY = n.getFullYear(); calM = n.getMonth(); renderCal(); };
$('#dateBtn').addEventListener('click', () => { calToday(); cal.hidden = false; });
$('#calPrev').addEventListener('click', () => { if (--calM < 0) { calM = 11; calY--; } renderCal(); });
$('#calNext').addEventListener('click', () => { if (++calM > 11) { calM = 0; calY++; } renderCal(); });
$('#calToday').addEventListener('click', calToday);
cal.addEventListener('click', e => { if (e.target.closest('[data-calclose]')) cal.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { cal.hidden = true; closeSheet(); } });

/* ---------- idle pet life: blinking ---------- */
$('#heroPet').src = petSrc('alien');
$('#heroPet').dataset.pet = 'alien'; $('#heroPet').classList.add('pet');
if (!reduced) setInterval(() => {
  document.querySelectorAll('img.pet').forEach(img => {
    if (Math.random() < 0.12) { img.src = petSrc(img.dataset.pet, true); setTimeout(() => (img.src = petSrc(img.dataset.pet)), 180); }
  });
}, 400);
$('#heroPet').addEventListener('click', () => { toast(nextMsg(), 'alien'); });

render();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
