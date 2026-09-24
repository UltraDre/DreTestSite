/* =========================================================
   DayGrid — Lifestyle Dashboard (vanilla JS PWA)
   ========================================================= */
'use strict';

/* ---------------- Utilities ---------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sum = (arr, f = x => x) => arr.reduce((t, x) => t + (Number(f(x)) || 0), 0);
const avg = (arr) => arr.length ? sum(arr) / arr.length : null;

const dateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayStr = () => dateStr(new Date());
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return dateStr(d); };
const toMin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const fromMin = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const diffMin = (s, e) => { const a = toMin(s), b = toMin(e); if (a == null || b == null) return null; let d = b - a; if (d < 0) d += 1440; return d; };
const fmtDur = (m) => {
  m = Math.round(m || 0);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};
const fmtHrs = (m) => (m / 60).toFixed(m >= 600 ? 0 : 1) + 'h';
const fmtDateLong = (s) => parseDate(s).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
const fmtDateShort = (s) => parseDate(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const weekdayIdx = (s) => (parseDate(s).getDay() + 6) % 7; // Mon=0
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ---------------- Storage (safe) ---------------- */
const Store = (() => {
  let ok = false; const mem = {};
  try { localStorage.setItem('__dg', '1'); localStorage.removeItem('__dg'); ok = true; } catch (e) { ok = false; }
  return {
    ok,
    get(k, d) {
      try { const v = ok ? localStorage.getItem(k) : mem[k]; return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set(k, v) {
      const s = JSON.stringify(v);
      if (ok) { try { localStorage.setItem(k, s); } catch (e) { toast('⚠️ Storage is full — export your data'); } }
      else mem[k] = s;
    },
  };
})();

/* ---------------- State ---------------- */
const DEFAULT_SETTINGS = {
  theme: 'auto', currency: '₦', target: 16, quickMode: 'frequent',
  tags: DEFAULT_TAGS.slice(), customActivities: {}, goals: [],
};
let activities = Store.get('dg.activities', []);
let settings = Object.assign({}, DEFAULT_SETTINGS, Store.get('dg.settings', {}));
let timer = Store.get('dg.timer', null);

const ui = {
  view: 'today', date: todayStr(), todayFilter: 'all',
  insRange: 7, insGroup: 'area', editingId: null, editingOrig: null,
  formTags: [], formRatings: {}, qsCategory: null, libExpanded: new Set(),
};

const saveActivities = () => Store.set('dg.activities', activities);
const saveSettings = () => Store.set('dg.settings', settings);
const saveTimer = () => Store.set('dg.timer', timer);

/* ---------------- Domain helpers ---------------- */
const cat = (id) => CAT_BY_ID[id] || CAT_BY_ID.other;
const isActual = (a) => a.status === 'Done' || a.status === 'In progress';
const activitiesFor = (cId) => [...cat(cId).activities, ...(settings.customActivities[cId] || [])];
const plannedMin = (a) => {
  if (a.plannedDuration) return +a.plannedDuration;
  if (a.plannedStart && a.plannedEnd) return diffMin(a.plannedStart, a.plannedEnd);
  if (a.status === 'Planned') return +a.duration || 0;
  return 0;
};
const inRange = (a, from, to) => a.date >= from && a.date <= to;

function inferCategory(name) {
  const n = (name || '').trim().toLowerCase();
  if (!n) return null;
  for (const c of CATEGORIES) for (const act of activitiesFor(c.id)) if (act.toLowerCase() === n) return { category: c.id, subcategory: act };
  for (const c of CATEGORIES) for (const act of activitiesFor(c.id)) if (n.includes(act.toLowerCase()) && act.length > 3) return { category: c.id, subcategory: act };
  const prev = activities.find(a => a.name.toLowerCase() === n);
  if (prev) return { category: prev.category, subcategory: prev.subcategory };
  return null;
}

/* ---------------- Toast ---------------- */
let toastTimer;
function toast(msg, actionLabel, action) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>` + (actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : '');
  if (actionLabel) t.querySelector('button').onclick = () => { action(); t.classList.remove('show'); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), actionLabel ? 5000 : 2600);
}

/* ---------------- Theme ---------------- */
function applyTheme() {
  const dark = settings.theme === 'dark' || (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  $('meta[name="theme-color"]').setAttribute('content', dark ? '#0d0f1a' : '#4f46e5');
}

/* =========================================================
   Navigation
   ========================================================= */
const VIEW_TITLES = { today: 'Today', log: 'Activity log', insights: 'Insights', library: 'Library', settings: 'Settings' };
function setView(v) {
  ui.view = v;
  $$('.nav-btn[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  $$('.view').forEach(s => s.classList.toggle('active', s.id === `view-${v}`));
  $('#viewTitle').textContent = v === 'today' ? (ui.date === todayStr() ? 'Today' : fmtDateLong(ui.date)) : VIEW_TITLES[v];
  $('#dateNav').classList.toggle('hidden', !['today', 'log', 'insights'].includes(v));
  render();
  window.scrollTo({ top: 0 });
}
function setDate(d) {
  ui.date = d;
  $('#datePicker').value = d;
  if (ui.view === 'today') $('#viewTitle').textContent = d === todayStr() ? 'Today' : fmtDateLong(d);
  render();
}

function render() {
  refreshDatalists();
  if (ui.view === 'today') renderToday();
  else if (ui.view === 'log') renderLog();
  else if (ui.view === 'insights') renderInsights();
  else if (ui.view === 'library') renderLibrary();
  else if (ui.view === 'settings') renderSettings();
  renderTimerBanner();
}

/* =========================================================
   TODAY
   ========================================================= */
function statCard(label, value, sub = '', emoji = '', pct = null) {
  return `<div class="stat">${emoji ? `<span class="emoji">${emoji}</span>` : ''}
    <div class="label">${esc(label)}</div><div class="value">${value}</div>
    ${sub ? `<div class="sub">${sub}</div>` : ''}
    ${pct != null ? `<div class="bar"><i style="width:${clamp(pct, 0, 100)}%"></i></div>` : ''}</div>`;
}
const ratingAvg = (items, key) => avg(items.map(a => a[key]).filter(Boolean));
const ratingDisplay = (v, key) => v == null ? '—' : `${v.toFixed(1)} <small style="font-size:1rem">${RATING_LABELS[key][clamp(Math.round(v), 1, 5) - 1]}</small>`;

function renderToday() {
  const d = ui.date;
  const items = activities.filter(a => a.date === d);
  const done = items.filter(isActual);
  const tracked = sum(done, a => a.duration);
  const planItems = items.filter(a => plannedMin(a) > 0 && a.status !== 'Cancelled');
  const planDone = planItems.filter(a => a.status === 'Done').length;
  const cost = sum(done, a => a.cost);
  const screen = sum(done, a => a.screenTime);
  const ints = sum(done, a => a.interruptions);

  $('#todayStats').innerHTML = [
    statCard('Tracked', fmtDur(tracked), `of ${settings.target}h target`, '⏱️', tracked / (settings.target * 60) * 100),
    statCard('Activities', `${done.length}<small class="muted" style="font-size:1rem"> / ${items.length}</small>`, 'done / logged', '✅'),
    statCard('Mood', ratingDisplay(ratingAvg(done, 'mood'), 'mood'), 'average'),
    statCard('Energy', ratingDisplay(ratingAvg(done, 'energy'), 'energy'), 'average'),
    statCard('Focus', ratingDisplay(ratingAvg(done, 'focus'), 'focus'), 'average'),
    statCard('Plan adherence', planItems.length ? Math.round(planDone / planItems.length * 100) + '%' : '—', `${planDone}/${planItems.length} planned done`, '🎯', planItems.length ? planDone / planItems.length * 100 : null),
    statCard('Spent', `${esc(settings.currency)}${cost.toLocaleString()}`, 'today', '💸'),
    statCard('Screen time', fmtDur(screen), `${ints} interruption${ints === 1 ? '' : 's'}`, '📱'),
  ].join('');

  renderTimeline(d);
  renderQuickStart();
  renderDonut($('#todayDonut'), groupMinutes(done, 'category'), 'category');
  renderDue(d);
  renderPlanVsActual(items);

  $$('#todayFilter button').forEach(b => b.classList.toggle('active', b.dataset.f === ui.todayFilter));
  let list = items.slice();
  if (ui.todayFilter !== 'all') list = list.filter(a => a.status === ui.todayFilter);
  list.sort((a, b) => (a.start || '99').localeCompare(b.start || '99'));
  $('#todayList').innerHTML = list.length ? list.map(actRow).join('')
    : `<div class="empty"><span class="big">🌤️</span>Nothing logged ${d === todayStr() ? 'yet today' : 'for this day'}.<br/>Tap <b>＋ Add</b> or start a timer.</div>`;
}

function renderTimeline(d) {
  const blocks = [], planned = [];
  const push = (arr, a, s, e) => { if (e > s) arr.push({ a, s: clamp(s, 0, 1440), e: clamp(e, 0, 1440) }); };
  for (const a of activities) {
    if (!a.start) continue;
    const s = toMin(a.start), dur = +a.duration || 0;
    const ps = a.plannedStart ? toMin(a.plannedStart) : s, pd = plannedMin(a);
    if (a.date === d) {
      if (isActual(a)) push(blocks, a, s, s + dur);
      if (a.status === 'Planned') push(planned, a, s, s + dur);
      else if (a.plannedStart && pd) push(planned, a, ps, ps + pd);
    } else if (a.date === addDays(d, -1)) {
      if (isActual(a) && s + dur > 1440) push(blocks, a, 0, s + dur - 1440);
      if (a.status === 'Planned' && s + dur > 1440) push(planned, a, 0, s + dur - 1440);
    }
  }
  const blockHtml = (b, cls) => {
    const c = cat(b.a.category), w = (b.e - b.s) / 14.4;
    return `<button class="tl-block ${cls}" data-id="${b.a.id}" style="left:${b.s / 14.4}%;width:${w}%;background:${c.color}"
      title="${esc(b.a.name)} · ${fromMin(b.s)}–${b.e >= 1440 ? '24:00' : fromMin(b.e)} (${fmtDur(b.e - b.s)})">${w > 2.2 ? c.icon : ''}</button>`;
  };
  const isToday = d === todayStr();
  const now = new Date(); const nowM = now.getHours() * 60 + now.getMinutes();
  const timerBlock = (timer && isToday && timer.date === d)
    ? `<div class="tl-block" style="left:${toMin(timer.start) / 14.4}%;width:${Math.max(0.4, (nowM - toMin(timer.start)) / 14.4)}%;background:${cat(timer.category).color};opacity:.7" title="Running: ${esc(timer.name)}"></div>` : '';
  $('#dayTimeline').innerHTML = `
    <div class="tl-track">${blocks.map(b => blockHtml(b, '')).join('')}${timerBlock}
      ${isToday ? `<div class="tl-now" style="left:${nowM / 14.4}%"></div>` : ''}</div>
    <div class="tl-track planned">${planned.map(b => blockHtml(b, 'pl')).join('')}</div>
    <div class="tl-axis">${[0, 3, 6, 9, 12, 15, 18, 21, 24].map(h => `<span>${pad(h)}</span>`).join('')}</div>
    ${!blocks.length && !planned.length ? '<div class="tl-empty">Add activities with start times to see your day take shape.</div>' : ''}`;
}

const DEFAULT_QUICK = [
  ['Deep work', 'work'], ['Meetings', 'work'], ['Email', 'work'], ['Walking', 'exercise'], ['Gym', 'exercise'],
  ['Cooking', 'food'], ['Cleaning', 'household'], ['Reading fiction', 'leisure'], ['Meditation', 'spiritual'],
  ['Commuting', 'travel'], ['Break', 'sleep'], ['Family time', 'social'],
];
function renderQuickStart() {
  let list = DEFAULT_QUICK.map(([name, category]) => ({ name, category }));
  if (settings.quickMode === 'frequent' && activities.length) {
    const counts = {};
    activities.forEach(a => { const k = a.name + '|' + a.category; counts[k] = (counts[k] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k]) => { const [name, category] = k.split('|'); return { name, category }; });
    const seen = new Set(top.map(t => t.name));
    list = [...top, ...list.filter(t => !seen.has(t.name))].slice(0, 12);
  }
  $('#quickStart').innerHTML = list.map(q => {
    const c = cat(q.category);
    const running = timer && timer.name === q.name;
    return `<button class="chip ${running ? 'on' : ''}" style="--c:${c.color}" data-qs-name="${esc(q.name)}" data-qs-cat="${q.category}">${c.icon} ${esc(q.name)}</button>`;
  }).join('');
}

function groupMinutes(items, by) {
  const m = {};
  for (const a of items) {
    const k = by === 'area' ? cat(a.category).area : a.category;
    m[k] = (m[k] || 0) + (+a.duration || 0);
  }
  return Object.entries(m).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
}
const groupMeta = (k, by) => by === 'area' ? { name: AREAS[k].name, color: AREAS[k].color, icon: '' } : { name: cat(k).name, color: cat(k).color, icon: cat(k).icon };

function renderDonut(el, entries, by) {
  const total = sum(entries, e => e[1]);
  if (!total) { el.innerHTML = `<div class="empty" style="flex:1"><span class="big">🍩</span>No completed activities yet.</div>`; return; }
  const r = 54, C = 2 * Math.PI * r; let off = 0;
  const segs = entries.map(([k, v]) => {
    const len = v / total * C, g = groupMeta(k, by);
    const s = `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${g.color}" stroke-width="18" stroke-dasharray="${Math.max(0, len - 1.5)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${esc(g.name)}: ${fmtDur(v)}</title></circle>`;
    off += len; return s;
  }).join('');
  el.innerHTML = `<svg viewBox="0 0 140 140" width="150" height="150" role="img" aria-label="Time by category">
      <circle r="${r}" cx="70" cy="70" fill="none" stroke="var(--bg-2)" stroke-width="18"/>${segs}
      <text x="70" y="68" text-anchor="middle" font-size="20" font-weight="800" fill="var(--text)">${fmtHrs(total)}</text>
      <text x="70" y="86" text-anchor="middle" font-size="10" fill="var(--muted)">tracked</text></svg>
    <div class="legend">${entries.slice(0, 8).map(([k, v]) => {
      const g = groupMeta(k, by);
      return `<div class="legend-row"><span class="dot" style="background:${g.color}"></span><span class="lbl">${g.icon} ${esc(g.name)}</span><span class="val">${fmtDur(v)} · ${Math.round(v / total * 100)}%</span></div>`;
    }).join('')}${entries.length > 8 ? `<small class="muted">+${entries.length - 8} more</small>` : ''}</div>`;
}

/* ---- Recurrence ---- */
function recurs(rule, originDate, d) {
  if (d < originDate) return false;
  const wd = weekdayIdx(d);
  switch (rule) {
    case 'Daily': return true;
    case 'Weekdays': return wd < 5;
    case 'Weekends': return wd >= 5;
    case 'Weekly': return wd === weekdayIdx(originDate);
    case 'Monthly': return parseDate(d).getDate() === parseDate(originDate).getDate();
    default: return false;
  }
}
function seriesDue(d) {
  const series = {};
  for (const a of activities) if (a.seriesId) (series[a.seriesId] = series[a.seriesId] || []).push(a);
  const out = [];
  for (const [sid, list] of Object.entries(series)) {
    list.sort((a, b) => a.date.localeCompare(b.date));
    const origin = list[0];
    const governing = list.filter(a => a.date <= d).pop();
    if (!governing || !governing.recurrence || governing.recurrence === 'None') continue;
    if (!recurs(governing.recurrence, origin.date, d)) continue;
    const instance = list.find(a => a.date === d);
    out.push({ sid, template: governing, instance });
  }
  return out.sort((a, b) => (a.template.start || '99').localeCompare(b.template.start || '99'));
}
function renderDue(d) {
  const due = seriesDue(d);
  $('#dueList').innerHTML = due.length ? due.map(({ sid, template: t, instance }) => {
    const c = cat(t.category);
    const st = instance ? instance.status : null;
    return `<div class="due ${st === 'Done' ? 'done' : ''}">
      <span class="ico">${c.icon}</span>
      <div class="t"><strong>${esc(t.name)}</strong><small>${t.recurrence}${t.start ? ' · ' + t.start : ''}${t.duration ? ' · ' + fmtDur(t.duration) : ''}</small></div>
      ${instance ? `<span class="status status-${st.replace(' ', '')}">${st}</span>`
        : `<button class="btn btn-ghost btn-sm" data-due-plan="${sid}">＋ Plan</button><button class="btn btn-primary btn-sm" data-due-done="${sid}">✓</button>`}
    </div>`;
  }).join('') : `<div class="empty"><span class="big">🔁</span>Set <b>Recurrence</b> on any activity (e.g. Daily vitamins, Weekly review) and it will show up here.</div>`;
}
function instantiateSeries(sid, status) {
  const d = ui.date;
  const t = seriesDue(d).find(x => x.sid === sid)?.template;
  if (!t) return;
  const copy = { ...t, id: uid(), date: d, status, createdAt: Date.now(), updatedAt: Date.now(),
    mood: null, energy: null, focus: null, satisfaction: null, notes: '', interruptions: 0, demo: false };
  copy.plannedStart = t.plannedStart || t.start; copy.plannedDuration = t.plannedDuration || t.duration;
  activities.push(copy); saveActivities(); render();
  toast(status === 'Done' ? `✓ ${t.name} done` : `📌 ${t.name} planned`);
}

function renderPlanVsActual(items) {
  const rows = {};
  for (const a of items) {
    if (a.status === 'Cancelled') continue;
    const p = plannedMin(a), act = isActual(a) ? (+a.duration || 0) : 0;
    if (!p) continue;
    const r = rows[a.category] = rows[a.category] || { p: 0, a: 0 };
    r.p += p; r.a += act;
  }
  const entries = Object.entries(rows).sort((x, y) => y[1].p - x[1].p);
  if (!entries.length) { $('#planVsActual').innerHTML = `<div class="empty"><span class="big">📐</span>Plan activities (status <b>Planned</b>) then mark them done to compare plan vs reality.</div>`; return; }
  const max = Math.max(...entries.map(([, r]) => Math.max(r.p, r.a)));
  const tp = sum(entries, e => e[1].p), ta = sum(entries, e => e[1].a);
  $('#planVsActual').innerHTML = entries.map(([k, r]) => {
    const c = cat(k), dlt = r.a - r.p;
    return `<div class="pva-row"><span>${c.icon} ${esc(c.name.split(' ')[0].replace(',', ''))}</span>
      <div class="pva-bars"><i class="p" style="width:${r.p / max * 100}%;background:${c.color}" title="Planned ${fmtDur(r.p)}"></i><i style="width:${r.a / max * 100}%;background:${c.color}" title="Actual ${fmtDur(r.a)}"></i></div>
      <span class="delta ${dlt > 0 ? 'pos' : dlt < 0 ? 'neg' : 'zero'}">${dlt > 0 ? '+' : dlt < 0 ? '−' : '±'}${fmtDur(Math.abs(dlt))}</span></div>`;
  }).join('') + `<div class="muted" style="font-size:.82rem;margin-top:6px">Planned <b>${fmtDur(tp)}</b> · Actual <b>${fmtDur(ta)}</b> · faded bar = plan</div>`;
}

/* ---- Activity row ---- */
function actRow(a) {
  const c = cat(a.category);
  const time = a.start ? `${a.start}${a.end ? '–' + a.end : ''}` : '';
  const meta = [c.name.split(/[ ,]/)[0] + (a.subcategory && a.subcategory !== a.name ? ' · ' + a.subcategory : ''),
    a.location ? '📍 ' + a.location : '', a.people ? '👥 ' + a.people : '', a.goal ? '🎯 ' + a.goal : ''].filter(Boolean).join('  ·  ');
  const mood = a.mood ? RATING_LABELS.mood[a.mood - 1] : '';
  return `<div class="act" data-id="${a.id}">
    <span class="stripe" style="background:${c.color}"></span>
    <span class="ico" style="background:color-mix(in srgb, ${c.color} 16%, transparent)">${c.icon}</span>
    <div class="main-col">
      <div class="title">${esc(a.name)} ${a.status !== 'Done' ? `<span class="status status-${a.status.replace(' ', '')}">${a.status}</span>` : ''}
        ${a.priority === 'High' || a.priority === 'Critical' ? `<span class="prio-${a.priority}" title="${a.priority} priority">▲</span>` : ''}
        ${a.recurrence && a.recurrence !== 'None' ? '<span title="Recurring" class="muted" style="font-size:.8rem">🔁</span>' : ''} ${mood}</div>
      <div class="meta">${esc(meta)}</div>
      ${a.tags && a.tags.length ? `<div class="tags">${a.tags.map(t => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="right"><span class="dur">${a.duration ? fmtDur(a.duration) : ''}</span><span>${time}</span>
      <div class="actions">
        ${a.status === 'Planned' ? `<button data-act="done" title="Mark done">✓</button>` : ''}
        <button data-act="dup" title="Duplicate">⧉</button><button data-act="del" title="Delete">🗑</button>
      </div></div>
  </div>`;
}

/* =========================================================
   LOG
   ========================================================= */
function logFiltered() {
  const q = $('#fSearch').value.trim().toLowerCase();
  const range = $('#fRange').value, area = $('#fArea').value, c = $('#fCategory').value, st = $('#fStatus').value, tg = $('#fTag').value;
  let from = '0000', to = '9999';
  if (range === 'day') from = to = ui.date;
  else if (range !== 'all') { to = ui.date; from = addDays(ui.date, -(+range - 1)); }
  return activities.filter(a => inRange(a, from, to)
    && (!area || cat(a.category).area === area) && (!c || a.category === c) && (!st || a.status === st)
    && (!tg || (a.tags || []).includes(tg))
    && (!q || [a.name, a.subcategory, a.notes, a.people, a.location, a.goal, a.distractions, (a.tags || []).join(' ')].join(' ').toLowerCase().includes(q)));
}
function refreshTagFilter() {
  const sel = $('#fTag'), cur = sel.value;
  const tags = [...new Set([...settings.tags, ...activities.flatMap(a => a.tags || [])])].sort();
  sel.innerHTML = '<option value="">Any tag</option>' + tags.map(t => `<option value="${esc(t)}">#${esc(t)}</option>`).join('');
  sel.value = cur;
}
function renderLog() {
  refreshTagFilter();
  const list = logFiltered().sort((a, b) => b.date.localeCompare(a.date) || (a.start || '99').localeCompare(b.start || '99'));
  const done = list.filter(isActual);
  $('#logSummary').innerHTML = `<b>${list.length}</b> activities · <b>${fmtDur(sum(done, a => a.duration))}</b> tracked · <b>${esc(settings.currency)}${sum(done, a => a.cost).toLocaleString()}</b> spent`;
  if (!list.length) { $('#logList').innerHTML = `<div class="empty"><span class="big">🔍</span>No activities match these filters.</div>`; return; }
  const groups = {};
  list.forEach(a => (groups[a.date] = groups[a.date] || []).push(a));
  $('#logList').innerHTML = Object.entries(groups).map(([d, arr]) => `
    <div class="day-group"><h3><span>${fmtDateLong(d)}</span><span>${fmtDur(sum(arr.filter(isActual), a => a.duration))}</span></h3>
    <div class="activity-list">${arr.map(actRow).join('')}</div></div>`).join('');
}
const CSV_FIELDS = ['date', 'start', 'end', 'duration', 'name', 'category', 'subcategory', 'area', 'tags', 'location', 'people', 'priority', 'status', 'recurrence',
  'energy', 'mood', 'focus', 'satisfaction', 'cost', 'goal', 'plannedStart', 'plannedEnd', 'plannedDuration', 'interruptions', 'distractions', 'device', 'screenTime', 'notes'];
function exportCsv(list) {
  const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows = [CSV_FIELDS.join(',')].concat(list.map(a => CSV_FIELDS.map(f => {
    if (f === 'category') return q(cat(a.category).name);
    if (f === 'area') return q(AREAS[cat(a.category).area].name);
    if (f === 'tags') return q((a.tags || []).map(t => '#' + t).join(' '));
    return q(a[f]);
  }).join(',')));
  download(`daygrid-${todayStr()}.csv`, rows.join('\n'), 'text/csv');
}
function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* =========================================================
   INSIGHTS
   ========================================================= */
function renderInsights() {
  $$('#insRange button').forEach(b => b.classList.toggle('active', +b.dataset.r === ui.insRange));
  $$('#insGroup button').forEach(b => b.classList.toggle('active', b.dataset.g === ui.insGroup));
  const N = ui.insRange, to = ui.date, from = addDays(to, -(N - 1));
  const items = activities.filter(a => inRange(a, from, to) && isActual(a));
  const days = Array.from({ length: N }, (_, i) => addDays(from, i));
  const total = sum(items, a => a.duration);
  const activeDays = new Set(items.map(a => a.date)).size || 1;
  const sleepMins = sum(items.filter(a => a.category === 'sleep' && /sleep/i.test(a.subcategory + a.name)), a => a.duration);
  const sleepDays = new Set(items.filter(a => a.category === 'sleep' && /sleep/i.test(a.subcategory + a.name)).map(a => a.date)).size;
  const exMins = sum(items.filter(a => a.category === 'exercise'), a => a.duration);

  $('#insStats').innerHTML = [
    statCard('Total tracked', fmtHrs(total), `${fmtDur(total / activeDays)} / active day`, '⏱️'),
    statCard('Avg sleep', sleepDays ? fmtDur(sleepMins / sleepDays) : '—', `${sleepDays} nights logged`, '😴'),
    statCard('Exercise', fmtDur(exMins), `${fmtDur(exMins / N * 7)} / week`, '🏃'),
    statCard('Mood', ratingDisplay(ratingAvg(items, 'mood'), 'mood'), 'average'),
    statCard('Energy', ratingDisplay(ratingAvg(items, 'energy'), 'energy'), 'average'),
    statCard('Satisfaction', ratingDisplay(ratingAvg(items, 'satisfaction'), 'satisfaction'), 'average'),
    statCard('Spent', `${esc(settings.currency)}${sum(items, a => a.cost).toLocaleString()}`, `${esc(settings.currency)}${Math.round(sum(items, a => a.cost) / N).toLocaleString()} / day`, '💸'),
    statCard('Screen time', fmtHrs(sum(items, a => a.screenTime)), `${sum(items, a => a.interruptions)} interruptions`, '📱'),
  ].join('');

  renderDailyChart(days, items);
  renderTopGroups(items, total);
  renderMoodByCategory(items);
  renderHourly(items);
  renderHeatmap(items);
  renderTopTags(items);
  renderCost(items);
  renderGoalsProgress(items, N);
  renderHighlights(items, days, from, to);
}

function renderDailyChart(days, items) {
  const by = ui.insGroup;
  const keys = by === 'area' ? Object.keys(AREAS) : CATEGORIES.map(c => c.id);
  const data = days.map(d => { const o = {}; items.filter(a => a.date === d).forEach(a => { const k = by === 'area' ? cat(a.category).area : a.category; o[k] = (o[k] || 0) + (+a.duration || 0); }); return o; });
  const used = keys.filter(k => data.some(o => o[k]));
  const maxM = Math.max(60, ...data.map(o => sum(Object.values(o))));
  const maxH = Math.ceil(maxM / 60 / 4) * 4;
  const W = 720, H = 230, L = 30, B = 22, T = 8, cw = (W - L) / days.length, bw = Math.max(2, cw * 0.68);
  const y = (m) => H - B - (m / 60) / maxH * (H - B - T);
  let g = '<g class="grid">';
  for (let h = 0; h <= maxH; h += maxH / 4) g += `<line x1="${L}" x2="${W}" y1="${y(h * 60)}" y2="${y(h * 60)}" /><text x="${L - 6}" y="${y(h * 60) + 3}" text-anchor="end">${h}h</text>`;
  g += '</g>';
  const step = days.length <= 7 ? 1 : days.length <= 31 ? 5 : 14;
  const bars = data.map((o, i) => {
    let acc = 0; const x = L + i * cw + (cw - bw) / 2;
    const rects = used.map(k => { const v = o[k] || 0; if (!v) return ''; const y1 = y(acc + v), h = y(acc) - y1; acc += v; const m = groupMeta(k, by);
      return `<rect x="${x}" y="${y1}" width="${bw}" height="${Math.max(0, h - 0.6)}" rx="${Math.min(3, bw / 3)}" fill="${m.color}"><title>${esc(m.name)}: ${fmtDur(v)}</title></rect>`; }).join('');
    const lbl = (i % step === 0 || i === days.length - 1) ? `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${days.length <= 7 ? WEEKDAYS[weekdayIdx(days[i])] : days[i].slice(5).replace('-', '/')}</text>` : '';
    return rects + lbl;
  }).join('');
  $('#insDaily').innerHTML = `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily time chart">${g}${bars}</svg></div>`;
  $('#insDailyLegend').innerHTML = used.map(k => { const m = groupMeta(k, by); return `<span class="legend-row"><span class="dot" style="background:${m.color}"></span>${m.icon} ${esc(m.name)}</span>`; }).join('');
}

function hbars(entries, fmt, colorOf, labelOf) {
  if (!entries.length) return `<div class="empty">No data in this range yet.</div>`;
  const max = Math.max(...entries.map(e => e[1]));
  return entries.map(([k, v]) => `<div class="hbar"><span class="lbl">${labelOf(k)}</span><div class="track"><i style="width:${v / max * 100}%;background:${colorOf(k)}"></i></div><span class="val">${fmt(v)}</span></div>`).join('');
}
function renderTopGroups(items, total) {
  const by = ui.insGroup;
  $('#insTop').innerHTML = hbars(groupMinutes(items, by).slice(0, 12), v => `${fmtHrs(v)} · ${Math.round(v / total * 100)}%`,
    k => groupMeta(k, by).color, k => { const m = groupMeta(k, by); return `${m.icon} ${esc(m.name)}`; });
}
function renderMoodByCategory(items) {
  const rows = {};
  items.forEach(a => { const r = rows[a.category] = rows[a.category] || { mood: [], energy: [] }; if (a.mood) r.mood.push(a.mood); if (a.energy) r.energy.push(a.energy); });
  const entries = Object.entries(rows).filter(([, r]) => r.mood.length || r.energy.length)
    .sort((a, b) => (avg(b[1].mood) || 0) - (avg(a[1].mood) || 0)).slice(0, 10);
  if (!entries.length) { $('#insMood').innerHTML = `<div class="empty">Rate mood & energy on activities to see what lifts you up.</div>`; return; }
  const dots = (v, color) => `<div class="dots" title="${v ? v.toFixed(1) : '—'}">${[1, 2, 3, 4, 5].map(i => `<i style="${v && i <= Math.round(v) ? `background:${color}` : ''}"></i>`).join('')}<small class="muted" style="margin-left:4px">${v ? v.toFixed(1) : '—'}</small></div>`;
  $('#insMood').innerHTML = `<div class="mood-row mood-head"><span>Category</span><span>Mood</span><span>Energy</span></div>` +
    entries.map(([k, r]) => { const c = cat(k); return `<div class="mood-row"><span class="lbl">${c.icon} ${esc(c.name.split(/[ ,]/)[0])}</span>${dots(avg(r.mood), '#ec4899')}${dots(avg(r.energy), '#f59e0b')}</div>`; }).join('');
}
function renderHourly(items) {
  const e = Array.from({ length: 24 }, () => []), m = Array.from({ length: 24 }, () => []);
  items.forEach(a => {
    if (!a.start) return;
    const s = toMin(a.start), dur = Math.max(1, +a.duration || 0);
    for (let t = s; t < s + dur; t += 60) { const h = Math.floor((t % 1440) / 60); if (a.energy) e[h].push(a.energy); if (a.mood) m[h].push(a.mood); }
  });
  const E = e.map(avg), M = m.map(avg);
  if (!E.some(v => v) && !M.some(v => v)) { $('#insHourly').innerHTML = `<div class="empty">Rate energy on timed activities to find your peak hours.</div>`; return; }
  const W = 360, H = 170, L = 22, B = 20, T = 8;
  const x = (h) => L + h * (W - L) / 23, y = (v) => H - B - (v - 1) / 4 * (H - B - T);
  const path = (arr) => { let d = '', pen = false; arr.forEach((v, h) => { if (v == null) { pen = false; return; } d += `${pen ? 'L' : 'M'}${x(h).toFixed(1)},${y(v).toFixed(1)} `; pen = true; }); return d; };
  let g = '<g class="grid">'; for (let v = 1; v <= 5; v++) g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`; g += '</g>';
  const xl = [0, 6, 12, 18, 23].map(h => `<text x="${x(h)}" y="${H - 5}" text-anchor="middle">${pad(h)}h</text>`).join('');
  const pts = (arr, c) => arr.map((v, h) => v == null ? '' : `<circle cx="${x(h)}" cy="${y(v)}" r="2.6" fill="${c}"><title>${pad(h)}:00 — ${v.toFixed(1)}</title></circle>`).join('');
  $('#insHourly').innerHTML = `<div class="chart"><svg viewBox="0 0 ${W} ${H}">${g}${xl}
    <path d="${path(E)}" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linejoin="round"/>${pts(E, '#f59e0b')}
    <path d="${path(M)}" fill="none" stroke="#ec4899" stroke-width="2.2" stroke-dasharray="5 4" stroke-linejoin="round"/>${pts(M, '#ec4899')}</svg></div>
    <div class="legend" style="flex-direction:row;gap:14px;margin-top:6px"><span class="legend-row"><span class="dot" style="background:#f59e0b"></span>Energy</span><span class="legend-row"><span class="dot" style="background:#ec4899"></span>Mood</span></div>`;
}
function renderHeatmap(items) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  items.forEach(a => {
    if (!a.start || a.category === 'sleep') return;
    let s = toMin(a.start), left = +a.duration || 0, wd = weekdayIdx(a.date);
    while (left > 0) { const h = Math.floor(s / 60) % 24, chunk = Math.min(left, 60 - (s % 60)); grid[wd][h] += chunk; left -= chunk; s += chunk; if (s >= 1440) { s -= 1440; wd = (wd + 1) % 7; } }
  });
  const max = Math.max(1, ...grid.flat());
  $('#insHeat').innerHTML = `<div class="heat"><span></span>${Array.from({ length: 24 }, (_, h) => `<span style="justify-content:center">${h % 6 === 0 ? h : ''}</span>`).join('')}
    ${grid.map((row, i) => `<span>${WEEKDAYS[i]}</span>${row.map((v, h) => `<i title="${WEEKDAYS[i]} ${pad(h)}:00 — ${fmtDur(v)}" style="${v ? `background:color-mix(in srgb, var(--primary-2) ${Math.round(15 + v / max * 85)}%, transparent)` : ''}"></i>`).join('')}`).join('')}</div>
    <small class="muted">Sleep excluded</small>`;
}
function renderTopTags(items) {
  const t = {};
  items.forEach(a => (a.tags || []).forEach(tag => { t[tag] = t[tag] || { n: 0, m: 0 }; t[tag].n++; t[tag].m += +a.duration || 0; }));
  const e = Object.entries(t).sort((a, b) => b[1].m - a[1].m).slice(0, 18);
  $('#insTags').innerHTML = e.length ? e.map(([k, v]) => `<button class="chip" data-tag-filter="${esc(k)}">#${esc(k)} <small>${fmtHrs(v.m)} · ${v.n}×</small></button>`).join('')
    : `<div class="empty" style="flex:1">Tag activities (e.g. #deep-work, #avoidable) to slice your time.</div>`;
}
function renderCost(items) {
  const m = {}; items.forEach(a => { if (+a.cost) m[a.category] = (m[a.category] || 0) + +a.cost; });
  const e = Object.entries(m).sort((a, b) => b[1] - a[1]);
  const total = sum(e, x => x[1]);
  $('#insCost').innerHTML = hbars(e, v => `${esc(settings.currency)}${Math.round(v).toLocaleString()}`, k => cat(k).color, k => `${cat(k).icon} ${esc(cat(k).name.split(/[ ,]/)[0])}`)
    + (total ? `<div class="muted" style="font-size:.85rem;margin-top:8px">Total <b>${esc(settings.currency)}${Math.round(total).toLocaleString()}</b></div>` : '');
}
function renderGoalsProgress(items, N) {
  const names = new Set([...settings.goals.map(g => g.name), ...items.map(a => a.goal).filter(Boolean)]);
  if (!names.size) { $('#insGoals').innerHTML = `<div class="empty">Add goals in <b>Library</b> and link activities to them.</div>`; return; }
  $('#insGoals').innerHTML = [...names].map(n => {
    const g = settings.goals.find(x => x.name === n);
    const mins = sum(items.filter(a => a.goal === n), a => a.duration);
    const target = g && g.target ? g.target * 60 * N / 7 : null;
    return `<div class="hbar"><span class="lbl">🎯 ${esc(n)}</span><div class="track"><i style="width:${target ? clamp(mins / target * 100, 0, 100) : 100}%;background:${target && mins >= target ? 'var(--success)' : 'var(--primary-2)'}"></i></div>
      <span class="val">${fmtHrs(mins)}${target ? ' / ' + fmtHrs(target) : ''}</span></div>`;
  }).join('');
}
function renderHighlights(items, days, from, to) {
  const out = [];
  if (!items.length) { $('#insHighlights').innerHTML = `<li><span>💡</span><span>Log a few days of activities — or load demo data in Settings — to unlock insights.</span></li>`; return; }
  const top = groupMinutes(items.filter(a => a.category !== 'sleep'), 'category')[0];
  if (top) out.push(['🏆', `Most of your waking time went to <b>${esc(cat(top[0]).name)}</b> (${fmtHrs(top[1])}).`]);
  const moodBy = {}; items.forEach(a => { if (a.mood) (moodBy[a.category] = moodBy[a.category] || []).push(a.mood); });
  const moodE = Object.entries(moodBy).filter(([, v]) => v.length >= 2).map(([k, v]) => [k, avg(v)]).sort((a, b) => b[1] - a[1]);
  if (moodE.length) out.push(['😄', `You feel best during <b>${esc(cat(moodE[0][0]).name)}</b> (mood ${moodE[0][1].toFixed(1)}/5).`]);
  if (moodE.length > 1) { const lo = moodE[moodE.length - 1]; out.push(['🌧️', `<b>${esc(cat(lo[0]).name)}</b> is your lowest-mood area (${lo[1].toFixed(1)}/5). Worth a look?`]); }
  const eh = Array.from({ length: 24 }, () => []);
  items.forEach(a => { if (a.start && a.energy) eh[Math.floor(toMin(a.start) / 60)].push(a.energy); });
  const peak = eh.map((v, h) => [h, v.length >= 2 ? avg(v) : 0]).sort((a, b) => b[1] - a[1])[0];
  if (peak && peak[1]) out.push(['⚡', `Your energy peaks around <b>${pad(peak[0])}:00</b> — protect it for deep work.`]);
  const avoid = sum(items.filter(a => (a.tags || []).includes('avoidable') || /scroll|procrastinat/i.test(a.name + a.subcategory)), a => a.duration);
  if (avoid) out.push(['🧭', `<b>${fmtDur(avoid)}</b> went to avoidable time (scrolling, procrastination, #avoidable).`]);
  const planned = activities.filter(a => inRange(a, from, to) && plannedMin(a) > 0 && a.status !== 'Cancelled');
  if (planned.length) { const pct = Math.round(planned.filter(a => a.status === 'Done').length / planned.length * 100); out.push(['🎯', `You completed <b>${pct}%</b> of planned activities.`]); }
  const dist = {}; items.forEach(a => (a.distractions || '').split(/[,;]/).map(s => s.trim().toLowerCase()).filter(Boolean).forEach(s => dist[s] = (dist[s] || 0) + 1));
  const topD = Object.entries(dist).sort((a, b) => b[1] - a[1])[0];
  if (topD) out.push(['🔕', `Top distraction: <b>${esc(topD[0])}</b> (${topD[1]}×).`]);
  let streak = 0; for (let d = to; ; d = addDays(d, -1)) { if (activities.some(a => a.date === d)) streak++; else break; if (streak > 365) break; }
  if (streak > 1) out.push(['🔥', `<b>${streak}-day</b> logging streak. Keep it going!`]);
  $('#insHighlights').innerHTML = out.map(([i, t]) => `<li><span>${i}</span><span>${t}</span></li>`).join('');
}

/* =========================================================
   LIBRARY
   ========================================================= */
function renderLibrary() {
  const q = $('#libSearch').value.trim().toLowerCase(), area = $('#libArea').value;
  const usage = {}; activities.forEach(a => { usage[a.category] = (usage[a.category] || 0) + 1; });
  $('#libCategories').innerHTML = CATEGORIES.filter(c => !area || c.area === area).map(c => {
    const custom = settings.customActivities[c.id] || [];
    const acts = [...c.activities.map(n => [n, false]), ...custom.map(n => [n, true])].filter(([n]) => !q || n.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    if (q && !acts.length) return '';
    const expanded = ui.libExpanded.has(c.id) || !!q;
    return `<article class="card lib-card ${expanded ? 'expanded' : ''}" style="--c:${c.color}">
      <div class="card-head" style="margin-bottom:8px"><div><div class="area-tag">${esc(AREAS[c.area].name)}</div><h2>${c.icon} ${esc(c.name)}</h2></div>
        <small class="muted">${usage[c.id] || 0} logged</small></div>
      <div class="chip-grid">${acts.map(([n, isCustom]) => `<button class="chip ${isCustom ? 'custom' : ''}" style="--c:${c.color}" data-lib-add="${esc(n)}" data-cat="${c.id}">${esc(n)}${isCustom ? `<span class="x" data-lib-rm="${esc(n)}" title="Remove">✕</span>` : ''}</button>`).join('')}</div>
      <div class="lib-foot">
        <form data-lib-form="${c.id}"><input type="text" placeholder="＋ Custom activity" required /><button class="btn btn-ghost btn-sm">Add</button></form>
        ${acts.length > 14 && !q ? `<button class="btn btn-ghost btn-sm" data-lib-expand="${c.id}">${expanded ? 'Less' : `All ${acts.length}`}</button>` : ''}
      </div></article>`;
  }).join('') || `<div class="empty">No activity matches “${esc(q)}”. Use the <b>Other</b> category or add a custom one.</div>`;

  const tagUse = {}; activities.forEach(a => (a.tags || []).forEach(t => tagUse[t] = (tagUse[t] || 0) + 1));
  $('#tagManager').innerHTML = settings.tags.map(t => `<span class="chip">#${esc(t)} <small>${tagUse[t] || 0}</small><button class="x" style="border:0;background:none;padding:0" data-tag-rm="${esc(t)}" title="Remove tag">✕</button></span>`).join('');

  const weekFrom = addDays(todayStr(), -6);
  $('#goalManager').innerHTML = settings.goals.length ? settings.goals.map(g => {
    const mins = sum(activities.filter(a => a.goal === g.name && isActual(a) && a.date >= weekFrom), a => a.duration);
    const pct = g.target ? clamp(mins / (g.target * 60) * 100, 0, 100) : null;
    return `<div class="goal"><span>🎯</span><div class="t"><strong>${esc(g.name)}</strong><small>${fmtDur(mins)} this week${g.target ? ` of ${g.target}h target` : ''}</small>
      ${pct != null ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ''}</div><button class="icon-btn" data-goal-rm="${g.id}" title="Remove">✕</button></div>`;
  }).join('') : `<div class="empty">No goals yet — add one below.</div>`;
}

/* =========================================================
   SETTINGS
   ========================================================= */
function renderSettings() {
  $('#setTheme').value = settings.theme;
  $('#setCurrency').value = settings.currency;
  $('#setTarget').value = settings.target;
  $('#setQuick').value = settings.quickMode;
  const days = new Set(activities.map(a => a.date)).size;
  $('#dataInfo').innerHTML = `${activities.length} activities across ${days} day${days === 1 ? '' : 's'} · ${(JSON.stringify(activities).length / 1024).toFixed(1)} KB`;
}

/* =========================================================
   Datalists
   ========================================================= */
function refreshDatalists() {
  const names = new Set();
  activities.forEach(a => names.add(a.name));
  CATEGORIES.forEach(c => activitiesFor(c.id).forEach(n => names.add(n)));
  $('#allActivitiesList').innerHTML = [...names].slice(0, 1500).map(n => `<option value="${esc(n)}">`).join('');
  const uniq = (key, extra) => [...new Set([...extra, ...activities.map(a => a[key]).filter(Boolean)])];
  $('#locList').innerHTML = uniq('location', ['Home', 'Office', 'Gym', 'Outdoors', 'Car', 'Bus', 'School', 'Café']).map(v => `<option value="${esc(v)}">`).join('');
  $('#peopleList').innerHTML = uniq('people', ['Alone', 'Partner', 'Family', 'Kids', 'Friends', 'Colleagues', 'Team']).map(v => `<option value="${esc(v)}">`).join('');
  $('#goalList').innerHTML = uniq('goal', settings.goals.map(g => g.name)).map(v => `<option value="${esc(v)}">`).join('');
}

/* =========================================================
   Quick-add sheet
   ========================================================= */
function openSheet() {
  ui.qsCategory = null;
  $('#qsSearch').value = '';
  renderSheet();
  $('#quickSheet').classList.remove('hidden');
  setTimeout(() => $('#qsSearch').focus(), 50);
}
function renderSheet() {
  const q = $('#qsSearch').value.trim().toLowerCase();
  $('#qsBack').classList.toggle('hidden', !ui.qsCategory);
  const chip = (name, cId) => { const c = cat(cId); return `<button class="chip" style="--c:${c.color}" data-pick-name="${esc(name)}" data-pick-cat="${cId}">${c.icon} ${esc(name)}</button>`; };
  if (q) {
    $('#qsTitle').textContent = 'Search results';
    const res = [];
    CATEGORIES.forEach(c => activitiesFor(c.id).forEach(n => { if (n.toLowerCase().includes(q)) res.push([n, c.id]); }));
    $('#qsBody').innerHTML = `<div class="chip-grid">${res.slice(0, 80).map(([n, c]) => chip(n, c)).join('')}
      <button class="chip" data-pick-name="${esc($('#qsSearch').value.trim())}" data-pick-cat="other">✳️ Use “${esc($('#qsSearch').value.trim())}” as Other</button></div>`;
    return;
  }
  if (ui.qsCategory) {
    const c = cat(ui.qsCategory);
    $('#qsTitle').textContent = `${c.icon} ${c.name}`;
    $('#qsBody').innerHTML = `<div class="chip-grid">${activitiesFor(c.id).map(n => chip(n, c.id)).join('')}
      <button class="chip" data-pick-name="" data-pick-cat="${c.id}">✳️ Other…</button></div>`;
    return;
  }
  $('#qsTitle').textContent = 'What are you doing?';
  const recent = []; const seen = new Set();
  [...activities].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).forEach(a => { const k = a.name + '|' + a.category; if (!seen.has(k) && recent.length < 10) { seen.add(k); recent.push([a.name, a.category]); } });
  $('#qsBody').innerHTML = (recent.length ? `<div class="qs-section"><h4>Recent</h4><div class="chip-grid">${recent.map(([n, c]) => chip(n, c)).join('')}</div></div>` : '') +
    `<div class="qs-section"><h4>Categories</h4><div class="cat-grid">${CATEGORIES.map(c => `<button class="cat-tile" style="--c:${c.color}" data-qs-cat-open="${c.id}"><span class="ic">${c.icon}</span><span class="nm">${esc(c.name)}</span><small>${activitiesFor(c.id).length} activities</small></button>`).join('')}</div></div>`;
}

/* =========================================================
   Activity form
   ========================================================= */
const F = () => $('#activityForm');
function fillSelect(sel, opts) { sel.innerHTML = opts.map(o => `<option>${esc(o)}</option>`).join(''); }
function initForm() {
  const f = F();
  f.elements.category.innerHTML = Object.entries(AREAS).map(([ak, a]) => `<optgroup label="${esc(a.name)}">${CATEGORIES.filter(c => c.area === ak).map(c => `<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join('')}</optgroup>`).join('');
  fillSelect(f.elements.status, FIELD_OPTIONS.status);
  fillSelect(f.elements.priority, FIELD_OPTIONS.priority);
  fillSelect(f.elements.recurrence, FIELD_OPTIONS.recurrence);
  fillSelect(f.elements.device, FIELD_OPTIONS.device);
  $('#fmRatings').innerHTML = Object.keys(RATING_LABELS).map(k => `<div class="rating" data-rating="${k}"><span>${k[0].toUpperCase() + k.slice(1)}</span>
    <div class="opts">${RATING_LABELS[k].map((e, i) => `<button type="button" data-v="${i + 1}" title="${i + 1}/5">${e}</button>`).join('')}</div></div>`).join('');
}
function updateSubList() {
  $('#subList').innerHTML = activitiesFor(F().elements.category.value).map(n => `<option value="${esc(n)}">`).join('');
}
function renderFormTags() {
  const box = $('#fmTags');
  const sugg = settings.tags.filter(t => !ui.formTags.includes(t)).slice(0, 12);
  box.innerHTML = ui.formTags.map(t => `<span class="chip on">#${esc(t)}<button type="button" class="x" style="border:0;background:none;padding:0;color:inherit" data-ftag-rm="${esc(t)}">✕</button></span>`).join('')
    + `<input type="text" id="fmTagInput" placeholder="${ui.formTags.length ? '' : 'Type a tag, press Enter'}" list="tagDatalist" />`;
  let s = $('#fmTagSuggest');
  if (!s) { s = document.createElement('div'); s.id = 'fmTagSuggest'; s.className = 'tag-suggest'; box.after(s); }
  s.innerHTML = sugg.map(t => `<button type="button" class="chip" data-ftag-add="${esc(t)}">＋ #${esc(t)}</button>`).join('');
}
function addFormTag(t) {
  t = String(t).trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
  if (!t || ui.formTags.includes(t)) return;
  ui.formTags.push(t);
  if (!settings.tags.includes(t)) { settings.tags.push(t); saveSettings(); }
  renderFormTags();
  $('#fmTagInput').focus();
}
function renderFormRatings() {
  $$('#fmRatings .rating').forEach(r => { const k = r.dataset.rating; $$('button', r).forEach(b => b.classList.toggle('on', +b.dataset.v === ui.formRatings[k])); });
}

function openForm(a = {}, { isNew = !a.id } = {}) {
  const f = F();
  f.reset();
  ui.editingId = isNew ? null : a.id;
  ui.editingOrig = isNew ? null : { ...a };
  const d = {
    name: '', category: 'other', subcategory: '', date: ui.date, start: '', end: '', duration: '',
    status: ui.date > todayStr() ? 'Planned' : 'Done', priority: 'None', recurrence: 'None', location: '', people: '',
    cost: '', goal: '', interruptions: '', distractions: '', device: 'None', screenTime: '', notes: '',
    plannedStart: '', plannedEnd: '', plannedDuration: '', ...a,
  };
  if (isNew && !a.start && d.date === todayStr()) { const n = toMin(nowHM()); d.start = fromMin(Math.floor(n / 5) * 5); }
  for (const k of ['name', 'category', 'subcategory', 'date', 'start', 'end', 'duration', 'status', 'priority', 'recurrence', 'location', 'people',
    'cost', 'goal', 'interruptions', 'distractions', 'device', 'screenTime', 'notes', 'plannedStart', 'plannedEnd', 'plannedDuration'])
    if (f.elements[k]) f.elements[k].value = d[k] ?? '';
  f.dataset.catTouched = a.category && a.category !== 'other' ? '1' : '';
  updateSubList();
  ui.formTags = [...(a.tags || [])];
  ui.formRatings = { energy: a.energy || null, mood: a.mood || null, focus: a.focus || null, satisfaction: a.satisfaction || null };
  renderFormTags(); renderFormRatings();
  $('#formTitle').textContent = isNew ? (a.name ? `New · ${a.name}` : 'New activity') : 'Edit activity';
  $('#fmDelete').classList.toggle('hidden', isNew);
  $('#fmDuplicate').classList.toggle('hidden', isNew);
  $('.sub-details', f).open = !!(d.plannedStart || d.plannedDuration);
  $('#formModal').classList.remove('hidden');
  setTimeout(() => (d.name ? f.elements.start : f.elements.name).focus(), 60);
}
function readForm() {
  const f = F(), v = (k) => f.elements[k].value.trim(), n = (k) => f.elements[k].value === '' ? null : Number(f.elements[k].value);
  let duration = n('duration');
  if (duration == null && v('start') && v('end')) duration = diffMin(v('start'), v('end'));
  return {
    name: v('name'), category: v('category'), subcategory: v('subcategory') || v('name'), tags: [...ui.formTags],
    date: v('date') || ui.date, start: v('start'), end: v('end'), duration: duration || 0,
    location: v('location'), people: v('people'), priority: v('priority'), status: v('status'), recurrence: v('recurrence'),
    energy: ui.formRatings.energy, mood: ui.formRatings.mood, focus: ui.formRatings.focus, satisfaction: ui.formRatings.satisfaction,
    cost: n('cost') || 0, notes: v('notes'), goal: v('goal'),
    plannedStart: v('plannedStart'), plannedEnd: v('plannedEnd'), plannedDuration: n('plannedDuration'),
    interruptions: n('interruptions') || 0, distractions: v('distractions'), device: v('device'), screenTime: n('screenTime') || 0,
  };
}
function saveForm(e) {
  e && e.preventDefault();
  const data = readForm();
  if (!data.name) { F().elements.name.focus(); toast('Give the activity a name'); return; }
  if (data.goal && !settings.goals.some(g => g.name === data.goal)) { settings.goals.push({ id: uid(), name: data.goal, target: null }); saveSettings(); }
  if (ui.editingId) {
    const i = activities.findIndex(a => a.id === ui.editingId);
    const orig = ui.editingOrig || {};
    if (orig.status === 'Planned' && data.status === 'Done' && !data.plannedDuration && !data.plannedStart) {
      data.plannedStart = orig.start; data.plannedEnd = orig.end; data.plannedDuration = orig.duration;
    }
    if (data.recurrence !== 'None' && !activities[i].seriesId) data.seriesId = activities[i].id;
    activities[i] = { ...activities[i], ...data, updatedAt: Date.now() };
    toast('✓ Activity updated');
  } else {
    const id = uid();
    activities.push({ id, ...data, seriesId: data.recurrence !== 'None' ? id : null, createdAt: Date.now(), updatedAt: Date.now() });
    toast(`✓ ${data.name} ${data.status === 'Planned' ? 'planned' : 'logged'}`);
  }
  saveActivities();
  closeOverlays();
  render();
}
function deleteActivity(id) {
  const i = activities.findIndex(a => a.id === id);
  if (i < 0) return;
  const [removed] = activities.splice(i, 1);
  saveActivities(); render();
  toast(`Deleted “${removed.name}”`, 'Undo', () => { activities.splice(i, 0, removed); saveActivities(); render(); });
}
function duplicateActivity(id) {
  const a = activities.find(x => x.id === id); if (!a) return;
  const { id: _, seriesId, createdAt, updatedAt, ...rest } = a;
  closeOverlays();
  openForm({ ...rest, date: ui.date, recurrence: 'None' }, { isNew: true });
}
function markDone(id) {
  const a = activities.find(x => x.id === id); if (!a) return;
  if (!a.plannedDuration && !a.plannedStart) { a.plannedStart = a.start; a.plannedEnd = a.end; a.plannedDuration = a.duration; }
  a.status = 'Done'; a.updatedAt = Date.now();
  saveActivities(); render();
  toast(`✓ ${a.name} done — tap it to rate how it felt`);
}
function closeOverlays() { $$('.overlay').forEach(o => o.classList.add('hidden')); }

/* =========================================================
   Timer
   ========================================================= */
function startTimer(tpl) {
  if (timer) stopTimer(true);
  const guess = tpl.category ? null : inferCategory(tpl.name);
  timer = {
    name: tpl.name, category: tpl.category || guess?.category || 'other', subcategory: tpl.subcategory || guess?.subcategory || tpl.name,
    tags: tpl.tags || [], goal: tpl.goal || '', location: tpl.location || '', people: tpl.people || '',
    startTs: Date.now(), date: todayStr(), start: nowHM(), interruptions: 0,
  };
  saveTimer(); render();
  toast(`▶ Timer started: ${timer.name}`);
}
function stopTimer(silent = false) {
  if (!timer) return;
  const mins = Math.max(1, Math.round((Date.now() - timer.startTs) / 60000));
  const a = {
    id: uid(), name: timer.name, category: timer.category, subcategory: timer.subcategory, tags: timer.tags, goal: timer.goal,
    location: timer.location, people: timer.people, date: timer.date, start: timer.start, end: fromMin(toMin(timer.start) + mins), duration: mins,
    status: 'Done', priority: 'None', recurrence: 'None', interruptions: timer.interruptions, cost: 0, screenTime: 0, device: 'None',
    notes: '', distractions: '', energy: null, mood: null, focus: null, satisfaction: null, createdAt: Date.now(), updatedAt: Date.now(),
  };
  activities.push(a); saveActivities();
  timer = null; saveTimer();
  if (!silent) { render(); openForm(a, { isNew: false }); toast(`■ Logged ${fmtDur(mins)} — how did it feel?`); }
}
function renderTimerBanner() {
  const b = $('#timerBanner');
  b.classList.toggle('hidden', !timer);
  if (!timer) return;
  const c = cat(timer.category);
  $('#timerName').textContent = `${c.icon} ${timer.name}`;
  $('#timerMeta').textContent = `${c.name} · started ${timer.start}`;
  $('#timerIntCount').textContent = timer.interruptions;
  tickTimer();
}
function tickTimer() {
  if (!timer) return;
  const s = Math.floor((Date.now() - timer.startTs) / 1000);
  $('#timerClock').textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
  document.title = `⏺ ${$('#timerClock').textContent} · ${timer.name}`;
}
setInterval(() => { if (timer) tickTimer(); else if (document.title.startsWith('⏺')) document.title = 'DayGrid — Lifestyle Dashboard'; }, 1000);
setInterval(() => { if (ui.view === 'today' && ui.date === todayStr()) renderTimeline(ui.date); }, 60000);

/* =========================================================
   Demo data
   ========================================================= */
function seedDemo() {
  activities = activities.filter(a => !a.demo);
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const energyAt = (m) => { const h = m / 60; return clamp(Math.round(h < 7 ? 2 : h < 11 ? 4.4 : h < 13 ? 3.8 : h < 16 ? 2.8 : h < 19 ? 3.5 : h < 21 ? 3 : 2) + rnd(-1, 1) * (Math.random() < .3 ? 1 : 0), 1, 5); };
  const MOOD = { sleep: 4, care: 3.6, health: 3, food: 4.2, exercise: 4.5, work: 3.2, study: 3.4, household: 2.8, errands: 2.9, finance: 2.6, social: 4.4, family: 4.5, leisure: 4, digital: 3, spiritual: 4.3, travel: 2.6, planning: 3.6, routines: 3.3, misc: 2.2 };
  const vitSeries = uid(), reviewSeries = uid(), medsSeries = uid();
  const today = todayStr(), nowM = toMin(nowHM());
  const weekday = [
    ['Waking up', 'routines', 'Waking up', '06:45', 10, { loc: 'Home', tags: ['habit'] }],
    ['Shower', 'care', 'Shower', '06:55', 20, { loc: 'Home', tags: ['self-care'] }],
    ['Morning prayer', 'spiritual', 'Prayer', '07:15', 15, { loc: 'Home', tags: ['habit', 'offline'] }],
    ['Breakfast', 'food', 'Breakfast', '07:30', 20, { loc: 'Home', cost: [0, 1500] }],
    ['Vitamins', 'health', 'Vitamins', '07:50', 5, { series: vitSeries, rec: 'Daily', tags: ['habit'] }],
    ['Commute to work', 'travel', 'Commuting', '07:55', 45, { loc: 'Bus', cost: [1500, 2500], tags: ['avoidable'], screen: 30, device: 'Phone' }],
    ['Inbox & Slack', 'work', 'Email', '08:40', 30, { loc: 'Office', tags: ['shallow-work', 'screen'], screen: 30, device: 'Laptop', goal: null }],
    ['Deep work: product roadmap', 'work', 'Deep work', '09:10', 110, { loc: 'Office', tags: ['deep-work', 'high-energy'], screen: 100, device: 'Laptop', goal: 'Ship Q4 roadmap', ints: [0, 4], dist: ['Slack', 'Phone', 'Noise', ''] }],
    ['Team stand-up & sync', 'work', 'Meetings', '11:00', 60, { loc: 'Office', people: 'Team', tags: ['shallow-work'], screen: 60, device: 'Laptop' }],
    ['Lunch with colleagues', 'food', 'Lunch', '12:00', 45, { loc: 'Café', people: 'Colleagues', cost: [2500, 5000], tags: ['with-friends'] }],
    ['Project work', 'work', 'Project work', '12:50', 130, { loc: 'Office', tags: ['deep-work'], screen: 120, device: 'Laptop', goal: 'Ship Q4 roadmap', ints: [1, 6], dist: ['Slack', 'Email', 'Colleague'] }],
    ['Afternoon slump', 'routines', 'Afternoon slump', '15:00', 15, { loc: 'Office', tags: ['avoidable', 'low-energy'], screen: 15, device: 'Phone' }],
    ['Client calls', 'work', 'Calls', '15:15', 45, { loc: 'Office', people: 'Clients', tags: ['shallow-work'] }],
    ['Admin & timesheets', 'work', 'Admin', '16:00', 30, { loc: 'Office', tags: ['shallow-work', 'screen'], screen: 30, device: 'Laptop' }],
    ['Commute home', 'travel', 'Commuting', '16:35', 50, { loc: 'Bus', cost: [1500, 2500], tags: ['avoidable'], screen: 35, device: 'Phone' }],
    ['EVENING_ACT', null, null, '17:30', 60, {}],
    ['Cooking dinner', 'food', 'Cooking', '18:35', 45, { loc: 'Home', tags: ['essential'] }],
    ['Dinner', 'food', 'Dinner', '19:20', 30, { loc: 'Home', people: 'Partner', tags: ['with-partner'] }],
    ['Dishes', 'household', 'Dishes', '19:50', 20, { loc: 'Home', tags: ['essential'] }],
    ['LEISURE_ACT', null, null, '20:10', 80, {}],
    ['Call family', 'social', 'Calling', '21:30', 25, { loc: 'Home', people: 'Family', tags: ['with-partner'] }],
    ['Journaling', 'spiritual', 'Journaling', '22:00', 15, { loc: 'Home', tags: ['habit', 'offline'] }],
    ['Evening routine', 'routines', 'Evening routine', '22:15', 30, { loc: 'Home', tags: ['self-care'] }],
    ['Sleep', 'sleep', 'Sleep', '22:50', 470, { loc: 'Home', people: 'Partner' }],
  ];
  const weekend = [
    ['Waking up', 'routines', 'Waking up', '08:00', 15, { loc: 'Home' }],
    ['Shower', 'care', 'Shower', '08:15', 25, { loc: 'Home', tags: ['self-care'] }],
    ['Vitamins', 'health', 'Vitamins', '08:40', 5, { series: vitSeries, rec: 'Daily', tags: ['habit'] }],
    ['Big breakfast', 'food', 'Breakfast', '08:45', 40, { loc: 'Home', people: 'Partner', tags: ['with-partner'] }],
    ['House cleaning', 'household', 'Cleaning', '09:30', 75, { loc: 'Home', tags: ['essential'] }],
    ['Laundry', 'household', 'Laundry', '10:45', 45, { loc: 'Home', tags: ['essential'] }],
    ['Grocery run', 'errands', 'Grocery shopping', '11:30', 70, { loc: 'Market', cost: [18000, 35000], tags: ['essential'] }],
    ['Lunch', 'food', 'Lunch', '13:00', 45, { loc: 'Home', people: 'Family' }],
    ['Family time', 'social', 'Family time', '14:00', 120, { loc: 'Home', people: 'Family', tags: ['with-kids', 'fun'] }],
    ['WEEKEND_ACTIVE', null, null, '16:15', 90, {}],
    ['Dinner out', 'food', 'Restaurant', '18:30', 90, { loc: 'Restaurant', people: 'Friends', cost: [12000, 25000], tags: ['with-friends', 'fun'] }],
    ['Movie night', 'leisure', 'Movies', '20:30', 120, { loc: 'Home', people: 'Partner', tags: ['screen', 'fun'], screen: 120, device: 'TV' }],
    ['Sleep', 'sleep', 'Sleep', '23:15', 500, { loc: 'Home', people: 'Partner' }],
  ];
  const evening = [['Gym session', 'exercise', 'Gym', { loc: 'Gym', cost: [0, 0], tags: ['high-energy', 'habit'], goal: 'Get fit' }],
    ['Evening run', 'exercise', 'Running', { loc: 'Outdoors', tags: ['outdoors', 'high-energy'], goal: 'Get fit' }],
    ['Pharmacy & errands', 'errands', 'Pharmacy', { loc: 'Pharmacy', cost: [3000, 9000], tags: ['essential'] }],
    ['Online course', 'study', 'Online course', { loc: 'Home', tags: ['deep-work', 'screen'], screen: 55, device: 'Laptop', goal: 'Learn data analysis' }]];
  const leisure = [['Watching TV', 'leisure', 'Watching TV', { loc: 'Home', tags: ['screen'], screen: 80, device: 'TV' }],
    ['Scrolling social media', 'digital', 'Social media', { loc: 'Home', tags: ['avoidable', 'screen'], screen: 80, device: 'Phone' }],
    ['Reading a novel', 'leisure', 'Reading fiction', { loc: 'Home', tags: ['offline', 'fun'] }],
    ['Gaming', 'leisure', 'Video games', { loc: 'Home', tags: ['screen', 'fun'], screen: 80, device: 'Console' }]];
  const wkActive = [['Hiking trail', 'exercise', 'Hiking', { loc: 'Outdoors', people: 'Friends', tags: ['outdoors', 'with-friends'], goal: 'Get fit' }],
    ['Beach walk', 'leisure', 'Beach', { loc: 'Beach', people: 'Family', tags: ['outdoors', 'with-kids'] }],
    ['Cycling', 'exercise', 'Cycling', { loc: 'Outdoors', tags: ['outdoors', 'high-energy'], goal: 'Get fit' }]];

  for (let back = 13; back >= 0; back--) {
    const d = addDays(today, -back), wd = weekdayIdx(d), isWE = wd >= 5;
    const plan = (isWE ? weekend : weekday).slice();
    if (wd === 6) plan.splice(plan.length - 1, 0, ['Weekly review', 'planning', 'Weekly review', '22:30', 30, { series: reviewSeries, rec: 'Weekly', loc: 'Home', tags: ['habit'] }]);
    if (wd < 5) plan.splice(4, 0, ['Blood pressure meds', 'health', 'Take medication', '07:52', 2, { series: medsSeries, rec: 'Weekdays', tags: ['habit', 'essential'] }]);
    for (let [name, c, sub, start, dur, o] of plan) {
      if (name === 'EVENING_ACT') { const p = evening[(wd + back) % evening.length]; [name, c, sub, o] = p; }
      if (name === 'LEISURE_ACT') { const p = leisure[rnd(0, leisure.length - 1)]; [name, c, sub, o] = p; }
      if (name === 'WEEKEND_ACTIVE') { const p = pick(wkActive); [name, c, sub, o] = p; }
      const pStart = toMin(start);
      const s = pStart + (dur > 10 ? rnd(-8, 12) : 0);
      const actualDur = Math.max(2, Math.round(dur * (1 + (Math.random() - 0.45) * 0.4)));
      const isFuture = d === today && s + actualDur > nowM;
      const baseMood = MOOD[c] || 3.5;
      const done = !isFuture && Math.random() > 0.04;
      const status = isFuture ? 'Planned' : done ? 'Done' : 'Skipped';
      const rated = status === 'Done' && Math.random() > 0.15;
      const a = {
        id: uid(), name, category: c, subcategory: sub, tags: o.tags || [], date: d,
        start: fromMin(isFuture ? pStart : s), end: fromMin((isFuture ? pStart : s) + (isFuture ? dur : actualDur)), duration: isFuture ? dur : actualDur,
        location: o.loc || '', people: o.people || (['work', 'errands', 'travel'].includes(c) ? '' : 'Alone'),
        priority: c === 'work' ? pick(['Medium', 'High', 'Medium']) : c === 'health' ? 'High' : 'None',
        status, recurrence: o.rec || 'None', seriesId: o.series || null,
        energy: rated ? energyAt(s) : null, mood: rated ? clamp(Math.round(baseMood + (Math.random() - 0.5) * 1.6), 1, 5) : null,
        focus: rated && ['work', 'study'].includes(c) ? clamp(Math.round(energyAt(s) + (Math.random() - 0.5)), 1, 5) : null,
        satisfaction: rated ? clamp(Math.round(baseMood + (Math.random() - 0.4)), 1, 5) : null,
        cost: o.cost ? Math.round(rnd(o.cost[0], o.cost[1]) / 100) * 100 : 0, notes: '', goal: o.goal || '',
        plannedStart: start, plannedEnd: fromMin(pStart + dur), plannedDuration: dur,
        interruptions: o.ints && status === 'Done' ? rnd(o.ints[0], o.ints[1]) : 0,
        distractions: o.dist && status === 'Done' ? pick(o.dist) : '',
        device: o.device || 'None', screenTime: o.screen && status === 'Done' ? Math.round(o.screen * (0.8 + Math.random() * 0.4)) : 0,
        createdAt: Date.now(), updatedAt: Date.now() - back * 86400000, demo: true,
      };
      activities.push(a);
    }
  }
  const goals = [['Ship Q4 roadmap', 12], ['Get fit', 4], ['Learn data analysis', 3]];
  goals.forEach(([n, t]) => { if (!settings.goals.some(g => g.name === n)) settings.goals.push({ id: uid(), name: n, target: t }); });
  saveSettings(); saveActivities();
  render();
  toast('✨ Loaded 14 days of demo data');
}

/* =========================================================
   Events
   ========================================================= */
function bindEvents() {
  // Navigation
  $$('.nav-btn[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  $('#settingsBtn').addEventListener('click', () => setView('settings'));
  [$('#navAdd'), $('#addBtn')].forEach(b => b.addEventListener('click', openSheet));
  $('#prevDay').addEventListener('click', () => setDate(addDays(ui.date, -1)));
  $('#nextDay').addEventListener('click', () => setDate(addDays(ui.date, 1)));
  $('#todayBtn').addEventListener('click', () => setDate(todayStr()));
  $('#datePicker').addEventListener('change', (e) => e.target.value && setDate(e.target.value));
  $('#themeBtn').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme;
    settings.theme = cur === 'dark' ? 'light' : 'dark'; saveSettings(); applyTheme();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);

  // Delegated clicks
  document.addEventListener('click', (e) => {
    const t = e.target;
    const row = t.closest('.act');
    if (row) {
      const act = t.closest('[data-act]')?.dataset.act, id = row.dataset.id;
      if (act === 'del') return deleteActivity(id);
      if (act === 'dup') return duplicateActivity(id);
      if (act === 'done') return markDone(id);
      const a = activities.find(x => x.id === id); if (a) openForm(a);
      return;
    }
    const tl = t.closest('.tl-block[data-id]');
    if (tl) { const a = activities.find(x => x.id === tl.dataset.id); if (a) openForm(a); return; }
    const qs = t.closest('[data-qs-name]');
    if (qs) return startTimer({ name: qs.dataset.qsName, category: qs.dataset.qsCat, subcategory: inferCategory(qs.dataset.qsName)?.subcategory });
    const dp = t.closest('[data-due-plan]'); if (dp) return instantiateSeries(dp.dataset.duePlan, 'Planned');
    const dd = t.closest('[data-due-done]'); if (dd) return instantiateSeries(dd.dataset.dueDone, 'Done');
    const tf = t.closest('[data-tag-filter]');
    if (tf) { setView('log'); refreshTagFilter(); $('#fTag').value = tf.dataset.tagFilter; $('#fRange').value = String(ui.insRange); renderLog(); return; }

    // Library
    const rm = t.closest('[data-lib-rm]');
    if (rm) { e.stopPropagation(); const cId = rm.closest('[data-cat]').dataset.cat; settings.customActivities[cId] = (settings.customActivities[cId] || []).filter(n => n !== rm.dataset.libRm); saveSettings(); renderLibrary(); return; }
    const la = t.closest('[data-lib-add]');
    if (la) return openForm({ name: la.dataset.libAdd, category: la.dataset.cat, subcategory: la.dataset.libAdd });
    const le = t.closest('[data-lib-expand]');
    if (le) { const id = le.dataset.libExpand; ui.libExpanded.has(id) ? ui.libExpanded.delete(id) : ui.libExpanded.add(id); renderLibrary(); return; }
    const tr = t.closest('[data-tag-rm]');
    if (tr) { settings.tags = settings.tags.filter(x => x !== tr.dataset.tagRm); saveSettings(); renderLibrary(); return; }
    const gr = t.closest('[data-goal-rm]');
    if (gr) { settings.goals = settings.goals.filter(g => g.id !== gr.dataset.goalRm); saveSettings(); renderLibrary(); return; }

    // Sheet
    const co = t.closest('[data-qs-cat-open]');
    if (co) { ui.qsCategory = co.dataset.qsCatOpen; renderSheet(); $('#qsBody').scrollTop = 0; return; }
    const pk = t.closest('[data-pick-cat]');
    if (pk) { closeOverlays(); openForm({ name: pk.dataset.pickName, category: pk.dataset.pickCat, subcategory: pk.dataset.pickName }); return; }

    // Form tags
    const fa = t.closest('[data-ftag-add]'); if (fa) return addFormTag(fa.dataset.ftagAdd);
    const fr = t.closest('[data-ftag-rm]'); if (fr) { ui.formTags = ui.formTags.filter(x => x !== fr.dataset.ftagRm); renderFormTags(); return; }

    // Close overlays
    if (t.closest('[data-close]') || t.classList.contains('overlay')) closeOverlays();
  });

  // Today filter
  $('#todayFilter').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { ui.todayFilter = b.dataset.f; renderToday(); } });
  const qsGo = () => { const v = $('#quickStartInput').value.trim(); if (!v) return; startTimer({ name: v }); $('#quickStartInput').value = ''; };
  $('#quickStartGo').addEventListener('click', qsGo);
  $('#quickStartInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') qsGo(); });

  // Timer
  $('#timerStop').addEventListener('click', () => stopTimer());
  $('#timerInterrupt').addEventListener('click', () => { if (!timer) return; timer.interruptions++; saveTimer(); $('#timerIntCount').textContent = timer.interruptions; });

  // Log filters
  ['#fSearch', '#fRange', '#fArea', '#fCategory', '#fStatus', '#fTag'].forEach(s => $(s).addEventListener('input', renderLog));
  $('#fReset').addEventListener('click', () => { $('#fSearch').value = ''; $('#fRange').value = '7'; ['#fArea', '#fCategory', '#fStatus', '#fTag'].forEach(s => $(s).value = ''); renderLog(); });
  $('#fCsv').addEventListener('click', () => exportCsv(logFiltered()));

  // Insights
  $('#insRange').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { ui.insRange = +b.dataset.r; renderInsights(); } });
  $('#insGroup').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { ui.insGroup = b.dataset.g; renderInsights(); } });

  // Library
  $('#libSearch').addEventListener('input', renderLibrary);
  $('#libArea').addEventListener('input', renderLibrary);
  $('#libCategories').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target.closest('[data-lib-form]'); if (!f) return;
    const v = f.querySelector('input').value.trim(); if (!v) return;
    const cId = f.dataset.libForm;
    settings.customActivities[cId] = [...new Set([...(settings.customActivities[cId] || []), v])];
    saveSettings(); ui.libExpanded.add(cId); renderLibrary(); toast(`Added “${v}” to ${cat(cId).name}`);
  });
  $('#tagForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const t = $('#tagInput').value.trim().replace(/^#/, '').toLowerCase().replace(/\s+/g, '-');
    if (t && !settings.tags.includes(t)) { settings.tags.push(t); saveSettings(); }
    $('#tagInput').value = ''; renderLibrary();
  });
  $('#goalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = $('#goalInput').value.trim(); if (!n) return;
    settings.goals.push({ id: uid(), name: n, target: $('#goalTarget').value ? +$('#goalTarget').value : null });
    saveSettings(); $('#goalInput').value = ''; $('#goalTarget').value = ''; renderLibrary();
  });

  // Settings
  $('#setTheme').addEventListener('change', (e) => { settings.theme = e.target.value; saveSettings(); applyTheme(); });
  $('#setCurrency').addEventListener('change', (e) => { settings.currency = e.target.value || '₦'; saveSettings(); });
  $('#setTarget').addEventListener('change', (e) => { settings.target = clamp(+e.target.value || 16, 1, 24); saveSettings(); });
  $('#setQuick').addEventListener('change', (e) => { settings.quickMode = e.target.value; saveSettings(); });
  $('#exportJson').addEventListener('click', () => download(`daygrid-backup-${todayStr()}.json`, JSON.stringify({ app: 'DayGrid', version: 1, exportedAt: new Date().toISOString(), activities, settings }, null, 2), 'application/json'));
  $('#exportCsv').addEventListener('click', () => exportCsv([...activities].sort((a, b) => a.date.localeCompare(b.date) || (a.start || '').localeCompare(b.start || ''))));
  $('#importJson').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.activities;
      if (!Array.isArray(list)) throw new Error('No activities found');
      const ids = new Set(activities.map(a => a.id));
      const fresh = list.filter(a => a && a.name && a.date && !ids.has(a.id)).map(a => ({ id: a.id || uid(), status: 'Done', category: 'other', tags: [], ...a }));
      activities.push(...fresh);
      if (data.settings) settings = Object.assign({}, settings, data.settings);
      saveActivities(); saveSettings(); applyTheme(); render();
      toast(`⬆ Imported ${fresh.length} activities`);
    } catch (err) { toast('⚠️ Import failed: ' + err.message); }
    e.target.value = '';
  });
  $('#seedDemo').addEventListener('click', seedDemo);
  $('#clearAll').addEventListener('click', () => {
    if (!confirm('Delete ALL activities, tags, goals and settings on this device? This cannot be undone.')) return;
    activities = []; settings = { ...DEFAULT_SETTINGS, tags: DEFAULT_TAGS.slice(), customActivities: {}, goals: [] }; timer = null;
    saveActivities(); saveSettings(); saveTimer(); applyTheme(); render(); toast('All data deleted');
  });

  // Sheet
  $('#qsSearch').addEventListener('input', renderSheet);
  $('#qsBack').addEventListener('click', () => { ui.qsCategory = null; renderSheet(); });
  $('#qsBlank').addEventListener('click', () => { closeOverlays(); openForm({}); });

  // Form
  const f = F();
  f.addEventListener('submit', saveForm);
  f.elements.category.addEventListener('change', () => { f.dataset.catTouched = '1'; updateSubList(); });
  f.elements.name.addEventListener('change', () => {
    if (f.dataset.catTouched) { if (!f.elements.subcategory.value) f.elements.subcategory.value = f.elements.name.value; return; }
    const g = inferCategory(f.elements.name.value);
    if (g) { f.elements.category.value = g.category; f.elements.subcategory.value = g.subcategory; updateSubList(); }
  });
  const recalc = (src) => {
    const s = f.elements.start.value, en = f.elements.end.value, d = f.elements.duration.value;
    if ((src === 'start' || src === 'end') && s && en) f.elements.duration.value = diffMin(s, en);
    else if (src === 'duration' && s && d !== '') f.elements.end.value = fromMin(toMin(s) + +d);
    else if (src === 'start' && s && d !== '' && !en) f.elements.end.value = fromMin(toMin(s) + +d);
  };
  f.elements.start.addEventListener('change', () => recalc('start'));
  f.elements.end.addEventListener('change', () => recalc('end'));
  f.elements.duration.addEventListener('input', () => recalc('duration'));
  const precalc = (src) => {
    const s = f.elements.plannedStart.value, en = f.elements.plannedEnd.value, d = f.elements.plannedDuration.value;
    if ((src === 's' || src === 'e') && s && en) f.elements.plannedDuration.value = diffMin(s, en);
    else if (src === 'd' && s && d !== '') f.elements.plannedEnd.value = fromMin(toMin(s) + +d);
  };
  f.elements.plannedStart.addEventListener('change', () => precalc('s'));
  f.elements.plannedEnd.addEventListener('change', () => precalc('e'));
  f.elements.plannedDuration.addEventListener('input', () => precalc('d'));
  $('#copyPlan').addEventListener('click', () => { f.elements.plannedStart.value = f.elements.start.value; f.elements.plannedEnd.value = f.elements.end.value; f.elements.plannedDuration.value = f.elements.duration.value; });
  $('#fmRatings').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const k = b.closest('.rating').dataset.rating, v = +b.dataset.v;
    ui.formRatings[k] = ui.formRatings[k] === v ? null : v; renderFormRatings();
  });
  $('#fmTags').addEventListener('keydown', (e) => {
    if (e.target.id !== 'fmTagInput') return;
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addFormTag(e.target.value); }
    else if (e.key === 'Backspace' && !e.target.value && ui.formTags.length) { ui.formTags.pop(); renderFormTags(); $('#fmTagInput').focus(); }
  });
  $('#fmTags').addEventListener('focusout', (e) => { if (e.target.id === 'fmTagInput' && e.target.value.trim()) addFormTag(e.target.value); });
  $('#fmDelete').addEventListener('click', () => { const id = ui.editingId; closeOverlays(); deleteActivity(id); });
  $('#fmDuplicate').addEventListener('click', () => duplicateActivity(ui.editingId));
  $('#fmStartTimer').addEventListener('click', () => {
    const d = readForm(); if (!d.name) { f.elements.name.focus(); toast('Give the activity a name'); return; }
    closeOverlays(); startTimer(d);
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return closeOverlays();
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName);
    const overlayOpen = $$('.overlay').some(o => !o.classList.contains('hidden'));
    if (typing || overlayOpen || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === 'n') { e.preventDefault(); openForm({}); }
    else if (k === 'q') { e.preventDefault(); openSheet(); }
    else if (k === 't') setDate(todayStr());
    else if (e.key === 'ArrowLeft') setDate(addDays(ui.date, -1));
    else if (e.key === 'ArrowRight') setDate(addDays(ui.date, 1));
    else if ('12345'.includes(k)) setView(['today', 'log', 'insights', 'library', 'settings'][+k - 1]);
  });
}

/* =========================================================
   PWA: service worker + install
   ========================================================= */
let deferredPrompt = null;
function initPWA() {
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; $('#installBtn').classList.remove('hidden'); });
  $('#installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; $('#installBtn').classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => toast('📲 DayGrid installed'));
  // Handle manifest shortcuts (?action=add / ?view=insights)
  const p = new URLSearchParams(location.search);
  if (p.get('view') && VIEW_TITLES[p.get('view')]) setView(p.get('view'));
  if (p.get('action') === 'add') setTimeout(openSheet, 200);
}

/* =========================================================
   Boot
   ========================================================= */
function init() {
  applyTheme();
  initForm();
  const tagDl = document.createElement('datalist'); tagDl.id = 'tagDatalist';
  tagDl.innerHTML = settings.tags.map(t => `<option value="${esc(t)}">`).join(''); document.body.appendChild(tagDl);
  const areaOpts = Object.entries(AREAS).map(([k, a]) => `<option value="${k}">${esc(a.name)}</option>`).join('');
  $('#fArea').insertAdjacentHTML('beforeend', areaOpts);
  $('#libArea').insertAdjacentHTML('beforeend', areaOpts);
  $('#fCategory').insertAdjacentHTML('beforeend', CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${esc(c.name)}</option>`).join(''));
  $('#fStatus').insertAdjacentHTML('beforeend', FIELD_OPTIONS.status.map(s => `<option>${s}</option>`).join(''));
  $('#datePicker').value = ui.date;
  $('#storageStatus').textContent = Store.ok ? '💾 Saved on this device' : '⚠️ Storage unavailable — data resets on reload';
  bindEvents();
  initPWA();
  render();
}
document.addEventListener('DOMContentLoaded', init);
