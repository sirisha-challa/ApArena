/* ApArena Accenture Mock Runner — AXIS 2026 pattern.
   Technical 45 MCQs / 45 min (no negative) + Coding DSA+SQL+UI / 60 min.
   ponytail: single-file exam engine; reuses window.Judge (Pyodide) + window.SQLJudge (sql.js). */
(function () {
'use strict';

var LS_KEY = 'accenture-mocks-v1';
var MANIFEST_URL = '/data/accenture-mocks.json';
var MOCK_URL = function (id) { return '/data/topics/' + id + '.json'; };
var TECH_PASS = 27; // 60% of 45 — sectional clear bar

var manifest = null;
var mockCache = {};
var bankCache = {};
function loadBank(url, cb) {
  if (bankCache[url]) return cb(bankCache[url]);
  fetch(url, { cache: 'default' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (j) { bankCache[url] = j; cb(j); })
  .catch(function () { cb([]); });
}
/* Resolve coding tasks shaped {kind, ref} against the arena banks.
   Mocks 1-2 embed full problem objects; newer mocks use refs to stay small. */
function resolveCodingRefs(mock, cb) {
  var tasks = (mock.coding && mock.coding.tasks) || [];
  var jobs = tasks.filter(function (t) { return !t.problem && t.ref; });
  if (!jobs.length) return cb(mock);
  var pending = jobs.length, failed = [];
  jobs.forEach(function (t) {
    var url = t.kind === 'sql' ? '/data/sql-problems.json' : '/data/coding-problems.json';
    loadBank(url, function (bank) {
      var found = null;
      (bank || []).forEach(function (p) { if (p.id === t.ref) found = p; });
      if (found) t.problem = found; else failed.push(t.ref);
      if (--pending === 0) {
        if (failed.length) {
          setContent('<div class="page-content"><div class="empty-state">Mock references unknown problem(s): '
            + esc(failed.join(', ')) + '.</div></div>');
          return;
        }
        cb(mock);
      }
    });
  });
}
var timerId = null;
var timerLeft = 0;
var techIdx = 0;
var codeTab = 0;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function math(s) { return esc(s); }
function getStore() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveStore(st) { localStorage.setItem(LS_KEY, JSON.stringify(st)); }
function mockState(id) {
  var st = getStore();
  if (!st[id]) st[id] = {};
  return { all: st, cur: st[id] };
}
function persistMock(id, cur) {
  var st = getStore(); st[id] = cur; saveStore(st);
}
function grade(pct) {
  if (pct >= 90) return { g: 'A+', c: '#10B981' };
  if (pct >= 80) return { g: 'A', c: '#10B981' };
  if (pct >= 70) return { g: 'B', c: '#3B82F6' };
  if (pct >= 60) return { g: 'C', c: '#F59E0B' };
  if (pct >= 40) return { g: 'D', c: '#EF4444' };
  return { g: 'F', c: '#EF4444' };
}
function setContent(html) {
  stopTimer();
  var el = document.getElementById('app-content');
  el.innerHTML = html;
  renderMath();
  window.scrollTo(0, 0);
}
function renderMath() {
  var c = document.getElementById('app-content');
  if (!c || !window.renderMathInElement) return;
  try {
    renderMathInElement(c, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  } catch (e) { /* progressive enhancement */ }
}
function fmtTime(s) {
  s = Math.max(0, s);
  var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  function p(n) { return (n < 10 ? '0' : '') + n; }
  return p(h) + ':' + p(m) + ':' + p(ss);
}
function stopTimer() {
  if (timerId) { clearInterval(timerId); timerId = null; }
  window.onbeforeunload = null;
}
function flatTechnical(mock) {
  var out = [];
  mock.technical.sections.forEach(function (sec) {
    sec.questions.forEach(function (q) { out.push({ sec: sec.title, q: q }); });
  });
  return out;
}
function cleared(id) {
  var s = mockState(id).cur;
  return !!(s.report && s.report.cleared);
}

/* ---------- data ---------- */
function loadManifest(cb) {
  if (manifest) return cb(manifest);
  fetch(MANIFEST_URL, { cache: 'default' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (j) { manifest = j; renderSidebar(); cb(j); })
  .catch(function () {
    setContent('<div class="page-content"><div class="empty-state">Could not load the mocks bank. Check /data/accenture-mocks.json.</div></div>');
  });
}
function loadMock(id, cb) {
  if (mockCache[id]) return cb(mockCache[id]);
  fetch(MOCK_URL(id), { cache: 'default' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (j) { mockCache[id] = j; resolveCodingRefs(j, cb); })
  .catch(function () {
    setContent('<div class="page-content"><div class="empty-state">Mock data not found yet — mocks release one at a time.</div></div>');
  });
}

/* ---------- sidebar / chrome ---------- */
function renderSidebar() {
  var nav = document.getElementById('sidebar-nav');
  if (!nav || !manifest) return;
  var topics = manifest.topics || [];
  var html = '<div class="sidebar-section-label">Mock Series</div>';
  topics.forEach(function (t) {
    var ready = (t.status || '') === 'ready';
    var dot = cleared(t.id) ? '#10B981' : ready ? '#F59E0B' : '#CBD5E1';
    html += '<button class="sidebar-item" data-mock="' + esc(t.id) + '"' + (ready ? '' : ' disabled style="opacity:.5"') + '>'
      + '<span class="sidebar-item-icon">' + esc(t.icon || 'M') + '</span>'
      + '<span class="sidebar-item-text">' + esc(t.title) + '</span>'
      + '<span class="sidebar-item-status" style="background:' + dot + '"></span></button>';
  });
  nav.innerHTML = html;
  nav.querySelectorAll('[data-mock]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.disabled) return;
      location.hash = '#/' + b.getAttribute('data-mock');
      closeSidebar();
    });
  });
  var pct = topics.length ? Math.round(topics.filter(function (t) { return cleared(t.id); }).length / topics.length * 100) : 0;
  document.getElementById('sidebar-progress-fill').style.width = pct + '%';
  document.getElementById('sidebar-progress-text').textContent = pct + '%';
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}
function updateBack(show) {
  document.getElementById('back-button').hidden = !show;
}

/* ---------- dashboard ---------- */
function vDashboard() {
  updateBack(false);
  document.getElementById('header-title').textContent = 'Accenture Mock Tests';
  var st = getStore();
  var topics = manifest.topics || [];
  var html = '<div class="page-content"><h1 class="text-2xl fw-700">Accenture Mock Series — Exact AXIS 2026 Pattern</h1>'
    + '<p class="text-muted">Each mock: <strong>Technical 45 MCQs / 45 min</strong> (Pseudocode 14 + MS Office 11 + Networking/Security/Cloud 9 + CS Foundations 11, no negative) + '
    + '<strong>Coding 3 tasks / 60 min</strong> (DSA + SQL JOINs + UI). Clear bar: Technical ≥ 27/45 <em>and</em> ≥ 1 coding task fully solved.</p>'
    + '<div class="mock-grid">';
  topics.forEach(function (t, i) {
    var ready = (t.status || '') === 'ready';
    var s = st[t.id] || {};
    var submitted = !!(s.technical && s.technical.submitted);
    var tech = submitted ? ('Technical ' + s.technical.score + '/45 · Grade ' + grade(Math.round(s.technical.score / 45 * 100)).g) : 'not attempted';
    var code = s.coding && s.coding.submitted ? 'Coding submitted' : 'not attempted';
    var cl = cleared(t.id) ? ' <span class="pill ready">CLEARED</span>' : (submitted ? ' <span class="pill ready">COMPLETED</span>' : '');
    html += '<div class="mock-card' + (ready ? '' : ' locked') + '">'
      + '<div class="row-flex"><strong>' + esc(t.title) + '</strong>'
      + '<span class="pill ' + (ready ? 'ready' : 'soon') + '">' + (ready ? 'READY' : 'SOON') + '</span>' + cl + '</div>'
      + '<p class="text-muted">' + esc((t.subtopics || []).join(' · ')) + '</p>'
      + '<p class="text-muted">' + esc(tech) + ' · ' + esc(code) + '</p>'
      + (ready
        ? '<button class="btn btn-primary btn-sm" data-open="' + esc(t.id) + '">' + (submitted ? 'Score & reports (locked)' : 'Start Mock ' + (i + 1)) + '</button>'
        : '<span class="text-muted">Unlocks one mock at a time.</span>')
      + '</div>';
  });
  html += '</div></div>';
  setContent(html);
  document.querySelectorAll('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () { location.hash = '#/' + b.getAttribute('data-open'); });
  });
}

/* ---------- mock home ---------- */
function techLine(cur) {
  var t = cur.technical;
  if (t && t.submitted) return 'Submitted — ' + t.score + '/45';
  if (t && t.answers && t.answers.some(function (a) { return a !== null && a !== undefined; })) return 'In progress';
  return 'Not started';
}
function codeLine(cur) {
  var c = cur.coding;
  if (c && c.submitted) return 'Submitted';
  if (c && (c.dsaRun || c.sqlRun || c.ui)) return 'In progress';
  return 'Not started';
}
function vMockHome(id) {
  loadMock(id, function (mock) {
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title;
    var ms = mockState(id).cur;
    var html = '<div class="page-content">'
      + '<h1 class="text-2xl fw-700">' + esc(mock.title) + ' — Technical + Coding</h1>'
      + '<p class="text-muted">' + esc(mock.pattern) + '</p>'
      + '<div class="report-card"><h3>Technical (45M)</h3><p>' + esc(techLine(ms)) + '</p><div class="row-flex">'
      + (ms.technical && ms.technical.submitted
        ? '<span class="pill ready">LOCKED · ' + ms.technical.score + '/45 · Grade ' + grade(Math.round(ms.technical.score / 45 * 100)).g + '</span>'
          + '<a class="btn btn-outline btn-sm" href="#/' + id + '/technical">Review report</a>'
        : '<a class="btn btn-primary btn-sm" href="#/' + id + '/technical">' + (techLine(ms) === 'In progress' ? 'Continue' : 'Start Technical (45 min)') + '</a>')
      + '</div></div>'
      + '<div class="report-card"><h3>Coding — DSA + SQL + UI (60 min)</h3><p>' + esc(codeLine(ms)) + '</p><div class="row-flex">'
      + '<a class="btn btn-primary btn-sm" href="#/' + id + '/coding">' + (codeLine(ms) === 'Not started' ? 'Start Coding' : 'Open / Review') + '</a>'
      + '</div></div>'
      + ((ms.technical && ms.technical.submitted)
        ? '<a class="btn btn-primary" href="#/' + id + '/report">Combined report + clear verdict</a>'
        : '<p class="text-muted">Combined report unlocks after Technical is submitted.</p>')
      + '</div>';
    setContent(html);
  });
}

/* ---------- technical exam ---------- */
function startTechTimer(id, mock) {
  stopTimer();
  window.onbeforeunload = function () { return 'Technical exam in progress.'; };
  timerId = setInterval(function () {
    timerLeft--;
    var el = document.getElementById('mock-clock');
    if (el) {
      el.textContent = fmtTime(timerLeft);
      if (timerLeft < 300) el.parentElement.classList.add('danger');
    }
    if (timerLeft <= 0) submitTechnical(id, mock, true);
  }, 1000);
}
function vTechnical(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    if (s.cur.technical && s.cur.technical.submitted) { vTechnicalReport(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Technical';
    if (!s.cur.technical) s.cur.technical = { answers: [], startedAt: Date.now() };
    var cur = s.cur.technical;
    var flat = flatTechnical(mock);
    while (cur.answers.length < flat.length) cur.answers.push(null);
    persistMock(id, s.cur);
    techIdx = 0;
    timerLeft = mock.technical.durationMin * 60;
    renderTechQ(id, mock);
    startTechTimer(id, mock);
  });
}
function renderTechQ(id, mock) {
  var s = mockState(id);
  var cur = s.cur.technical;
  var flat = flatTechnical(mock);
  var i = Math.min(techIdx, flat.length - 1);
  techIdx = i;
  var item = flat[i];
  var answered = cur.answers.filter(function (a) { return a !== null && a !== undefined; }).length;
  var html = '<div class="page-content">'
    + '<div class="mock-timer"><span>Technical — 45Q · 45 min · no negative</span>'
    + '<span class="clock" id="mock-clock">' + fmtTime(timerLeft) + '</span>'
    + '<span class="text-muted">' + answered + '/45 answered</span>'
    + '<span style="flex:1"></span><button class="btn btn-primary btn-sm" id="tech-submit">Submit Technical</button></div>'
    + '<div class="palette">' + flat.map(function (f, k) {
      return '<button data-jump="' + k + '" title="' + esc(f.sec) + '" class="' + (cur.answers[k] !== null && cur.answers[k] !== undefined ? 'ans' : '') + (k === i ? ' cur' : '') + '">' + (k + 1) + '</button>';
    }).join('') + '</div>'
    + '<div class="exam-q"><div class="q-head"><span class="q-num">Q' + (i + 1) + '/45</span>'
    + '<span class="pill">' + esc(item.sec) + '</span><span class="pill">1M</span></div>'
    + '<div>' + math(item.q.q) + '</div>'
    + '<div class="mcq-options">' + item.q.opts.map(function (o, oi) {
      return '<button class="mcq-option' + (cur.answers[i] === oi ? ' opt-picked' : '') + '" data-opt="' + oi + '">'
        + '<span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>'
        + '<span class="option-text">' + math(o) + '</span></button>';
    }).join('') + '</div></div>'
    + '<div class="row-flex"><button class="btn btn-outline btn-sm" id="tech-prev"' + (i === 0 ? ' disabled' : '') + '>Prev</button>'
    + '<button class="btn btn-outline btn-sm" id="tech-next"' + (i === flat.length - 1 ? ' disabled' : '') + '>Next</button>'
    + '<button class="btn btn-ghost btn-sm" id="tech-clear">Clear answer</button></div></div>';
  var el = document.getElementById('app-content');
  el.innerHTML = html;
  renderMath();
  window.scrollTo(0, 0);
  el.querySelectorAll('[data-opt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var st2 = mockState(id);
      st2.cur.technical.answers[i] = parseInt(b.getAttribute('data-opt'), 10);
      persistMock(id, st2.cur);
      renderTechQ(id, mock);
    });
  });
  el.querySelectorAll('[data-jump]').forEach(function (b) {
    b.addEventListener('click', function () {
      techIdx = parseInt(b.getAttribute('data-jump'), 10);
      renderTechQ(id, mock);
    });
  });
  document.getElementById('tech-prev').addEventListener('click', function () { techIdx = Math.max(0, i - 1); renderTechQ(id, mock); });
  document.getElementById('tech-next').addEventListener('click', function () { techIdx = Math.min(flat.length - 1, i + 1); renderTechQ(id, mock); });
  document.getElementById('tech-clear').addEventListener('click', function () {
    var st3 = mockState(id); st3.cur.technical.answers[i] = null; persistMock(id, st3.cur); renderTechQ(id, mock);
  });
  document.getElementById('tech-submit').addEventListener('click', function () { submitTechnical(id, mock, false); });
}
function submitTechnical(id, mock, auto) {
  var s = mockState(id);
  var cur = s.cur.technical;
  if (!cur || cur.submitted) return;
  var flat = flatTechnical(mock);
  var un = cur.answers.filter(function (a) { return a === null || a === undefined; }).length;
  if (!auto) {
    if (!confirm('Submit Technical? ' + un + ' unanswered (no negative — consider answering all). Answers will be revealed in the report.')) return;
  }
  var correct = 0;
  flat.forEach(function (f, k) { if (cur.answers[k] === f.q.c) correct++; });
  cur.submitted = true;
  cur.correct = correct;
  cur.score = correct; // 1M each, no negative
  cur.at = Date.now();
  persistMock(id, s.cur);
  renderSidebar();
  vTechnicalReport(id);
}
function vTechnicalReport(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    var cur = s.cur.technical;
    if (!cur || !cur.submitted) { vTechnical(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Technical Report';
    var flat = flatTechnical(mock);
    var pct = Math.round(cur.score / mock.technical.totalMarks * 100);
    var gr = grade(pct);
    var split = {};
    flat.forEach(function (f, k) {
      split[f.sec] = split[f.sec] || { n: 0, ok: 0 };
      split[f.sec].n++;
      if (cur.answers[k] === f.q.c) split[f.sec].ok++;
    });
    var html = '<div class="page-content"><div class="report-card"><div class="row-flex">'
      + '<span class="grade-big" style="color:' + gr.c + '">' + gr.g + '</span>'
      + '<div><h2>Technical: ' + cur.score + ' / ' + mock.technical.totalMarks + '</h2>'
      + '<p class="text-muted">Correct ' + cur.correct + ' · Wrong ' + wrongCount(cur, flat) + ' · Blank ' + blankCount(cur)
      + ' · ' + pct + '% (no negative marking)</p>'
      + '<p class="text-muted">Clear bar: ≥ ' + TECH_PASS + '/45. '
      + (cur.score >= TECH_PASS ? '<span class="verdict-clear">Section CLEARED</span>' : '<span class="verdict-fail">Section NOT cleared</span>') + '</p></div>'
      + '</div>'
      + '<table class="split-table"><tr><th>Section</th><th>Score</th><th>Status</th></tr>'
      + Object.keys(split).map(function (k) {
        var sc = split[k], p = Math.round(sc.ok / sc.n * 100);
        var bad = p < 60;
        return '<tr><td>' + esc(k) + '</td><td>' + sc.ok + '/' + sc.n + ' (' + p + '%)</td>'
          + '<td>' + (bad ? '<span class="pill risk">AT RISK</span>' : '<span class="pill ready">OK</span>') + '</td></tr>';
      }).join('') + '</table></div>';
    flat.forEach(function (f, k) {
      var a = cur.answers[k];
      var ok = a === f.q.c;
      html += '<div class="exam-q' + (a === null || a === undefined ? '' : ok ? ' rev-correct' : ' rev-wrong') + '">'
        + '<div class="q-head"><span class="q-num">Q' + (k + 1) + '</span><span class="pill">' + esc(f.sec) + '</span>'
        + '<span class="pill">' + (a === null || a === undefined ? 'blank' : ok ? 'correct +1' : 'wrong (your: ' + String.fromCharCode(65 + a) + ')') + '</span></div>'
        + '<div>' + math(f.q.q) + '</div>'
        + '<div class="mcq-options">' + f.q.opts.map(function (o, oi) {
          var cls = 'mcq-option' + (oi === f.q.c ? ' correct' : (a === oi ? ' wrong' : ''));
          return '<button class="' + cls + '" disabled><span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>'
            + '<span class="option-text">' + math(o) + '</span></button>';
        }).join('') + '</div>'
        + '<div class="model-ans"><strong>Answer: ' + String.fromCharCode(65 + f.q.c) + ' — ' + esc(f.q.opts[f.q.c]) + '</strong>'
        + (f.q.exp && f.q.exp.length ? f.q.exp.map(function (e) { return '<div>' + math(e) + '</div>'; }).join('') : '')
        + '<div class="text-muted">Source bank: ' + esc(f.q.source || '—') + '</div>'
        + '</div></div>';
    });
    html += '<div class="row-flex"><a class="btn btn-primary btn-sm" href="#/' + id + '">Back to ' + esc(mock.title) + '</a>'
      + '<a class="btn btn-outline btn-sm" href="#/' + id + '/report">Combined report</a></div></div>';
    setContent(html);
  });
}
function wrongCount(cur, flat) {
  var w = 0;
  flat.forEach(function (f, k) {
    var a = cur.answers[k];
    if (a !== null && a !== undefined && a !== f.q.c) w++;
  });
  return w;
}
function blankCount(cur) {
  return cur.answers.filter(function (a) { return a === null || a === undefined; }).length;
}

/* ---------- coding exam ---------- */
function codeStore(id) {
  var s = mockState(id);
  if (!s.cur.coding) s.cur.coding = {};
  return s;
}
function startCodeTimer(id, mock) {
  stopTimer();
  window.onbeforeunload = function () { return 'Coding exam in progress.'; };
  timerId = setInterval(function () {
    timerLeft--;
    var el = document.getElementById('mock-clock');
    if (el) {
      el.textContent = fmtTime(timerLeft);
      if (timerLeft < 300) el.parentElement.classList.add('danger');
    }
    if (timerLeft <= 0) submitCoding(id, mock, true);
  }, 1000);
}
function vCoding(id) {
  loadMock(id, function (mock) {
    var s = codeStore(id);
    if (s.cur.coding.submitted) { vCodingReview(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Coding';
    persistMock(id, s.cur);
    timerLeft = mock.coding.durationMin * 60;
    codeTab = 0;
    renderCodeTask(id, mock);
    startCodeTimer(id, mock);
  });
}
function taskStatus(id, mock, ti) {
  var s = mockState(id).cur.coding || {};
  var t = mock.coding.tasks[ti];
  if (t.kind === 'ui') {
    if (s.ui === 'solved') return { label: 'Solved (self-marked)', cls: 'ready' };
    if (s.ui === 'partial') return { label: 'Partial (self-marked)', cls: 'soon' };
    return { label: 'Not marked', cls: '' };
  }
  var r = s[t.kind + 'Run'];
  if (r && r.total > 0 && r.passed === r.total) return { label: 'Solved ' + r.passed + '/' + r.total, cls: 'ready' };
  if (r && r.passed > 0) return { label: 'Partial ' + r.passed + '/' + r.total, cls: 'soon' };
  return { label: 'Not solved', cls: '' };
}
function renderCodeTask(id, mock) {
  var tasks = mock.coding.tasks;
  var ti = Math.min(codeTab, tasks.length - 1);
  codeTab = ti;
  var t = tasks[ti];
  var s = mockState(id).cur.coding || {};
  var answered = tasks.filter(function (_, k) {
    var st = taskStatus(id, mock, k);
    return st.cls === 'ready';
  }).length;
  var html = '<div class="page-content">'
    + '<div class="mock-timer"><span>Coding — DSA + SQL + UI · 60 min</span>'
    + '<span class="clock" id="mock-clock">' + fmtTime(timerLeft) + '</span>'
    + '<span class="text-muted">' + answered + '/3 solved</span>'
    + '<span style="flex:1"></span><button class="btn btn-primary btn-sm" id="code-submit">Submit Coding</button></div>'
    + '<div class="code-tabs">' + tasks.map(function (x, k) {
      var st = taskStatus(id, mock, k);
      var nm = x.kind === 'dsa' ? 'DSA' : x.kind === 'sql' ? 'SQL' : 'UI';
      return '<button data-ctab="' + k + '" class="' + (k === ti ? 'cur' : '') + '">' + nm + ' · ' + esc(st.label) + '</button>';
    }).join('') + '</div>'
    + '<div id="code-task-body"></div></div>';
  var el = document.getElementById('app-content');
  el.innerHTML = html; // direct inject: timer keeps running
  renderMath();
  window.scrollTo(0, 0);
  el.querySelectorAll('[data-ctab]').forEach(function (b) {
    b.addEventListener('click', function () {
      persistCodeEditor(id, mock, ti);
      codeTab = parseInt(b.getAttribute('data-ctab'), 10);
      renderCodeTask(id, mock);
    });
  });
  document.getElementById('code-submit').addEventListener('click', function () {
    persistCodeEditor(id, mock, ti);
    submitCoding(id, mock, false);
  });
  renderTaskBody(id, mock, ti);
}
function persistCodeEditor(id, mock, ti) {
  var ed = document.getElementById('editor');
  if (!ed) return;
  var s = codeStore(id);
  var t = mock.coding.tasks[ti];
  var key = t.kind === 'ui' ? 'uiCode' : t.kind + 'Code';
  s.cur.coding[key] = ed.value;
  persistMock(id, s.cur);
}
function taskCode(id, mock, ti, fallback) {
  var s = (mockState(id).cur.coding || {});
  var t = mock.coding.tasks[ti];
  var key = t.kind === 'ui' ? 'uiCode' : t.kind + 'Code';
  return s[key] !== undefined ? s[key] : fallback;
}
function renderTaskBody(id, mock, ti) {
  var t = mock.coding.tasks[ti];
  var body = document.getElementById('code-task-body');
  if (t.kind === 'ui') {
    var s = (mockState(id).cur.coding || {});
    body.innerHTML = '<div class="exam-q"><div class="q-head"><span class="q-num">UI Task</span>'
      + '<span class="pill">' + esc(t.difficulty || 'easy') + '</span></div>'
      + '<div>' + esc(t.statement) + '</div>'
      + '<p class="text-muted">Checklist (verify in your head or a scratch file):</p>'
      + '<ul>' + t.checklist.map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>'
      + '<p class="text-muted">Reference starter (HTML+CSS+JS in one file):</p>'
      + '<textarea class="code-editor" id="editor">' + esc(taskCode(id, mock, ti, t.starter)) + '</textarea>'
      + '<p>Self-mark this task:</p><div class="row-flex">'
      + ['solved', 'partial', 'skipped'].map(function (v) {
        return '<label><input type="radio" name="ui-mark" value="' + v + '"' + (s.ui === v ? ' checked' : '') + '> ' + v + '</label>';
      }).join('') + '</div></div>';
    body.querySelectorAll('input[name="ui-mark"]').forEach(function (r) {
      r.addEventListener('change', function () {
        var st = codeStore(id); st.cur.coding.ui = r.value; persistMock(id, st.cur);
      });
    });
    var ed = document.getElementById('editor');
    ed.addEventListener('input', function () { persistCodeEditor(id, mock, ti); });
    return;
  }
  var p = t.problem;
  var isDsa = t.kind === 'dsa';
  var samples = (p.samples || []).map(function (x) {
    return '<div><strong>Input:</strong><pre>' + esc(x.stdin) + '</pre>'
      + '<strong>Output:</strong><pre>' + esc(x.expected) + '</pre></div>';
  }).join('');
  body.innerHTML = '<div class="exam-q"><div class="q-head"><span class="q-num">' + (isDsa ? 'DSA' : 'SQL') + '</span>'
    + '<span class="pill">' + esc(p.difficulty || '') + '</span><span class="pill">' + esc(p.title) + '</span></div>'
    + '<div>' + (isDsa ? esc(p.statement) : esc(p.statement)) + '</div>'
    + (samples ? '<div class="model-ans"><strong>Samples:</strong>' + samples + '</div>' : '')
    + (isDsa ? '' : '<p class="text-muted">Schema: ' + esc((p.tables || []).map(function (x) { return x.name; }).join(', ')) + '</p>')
    + '</div>'
    + '<textarea class="code-editor" id="editor" spellcheck="false">' + esc(taskCode(id, mock, ti, p.starter || '')) + '</textarea>'
    + '<div class="row-flex" style="margin-top:8px">'
    + '<button class="btn btn-primary btn-sm" id="btn-run-sample">Run samples</button>'
    + '<button class="btn btn-outline btn-sm" id="btn-run-all">Run all tests</button>'
    + '<span class="text-muted" id="' + (isDsa ? 'py-status' : 'sql-status') + '"></span></div>'
    + '<div class="judge-summary idle" id="judge-summary">Run your code to see results.</div>'
    + '<div id="judge-list"></div>';
  document.getElementById('editor').addEventListener('input', function () { persistCodeEditor(id, mock, ti); });
  if (isDsa && window.Judge) Judge.ensureWorker();
  if (!isDsa && window.SQLJudge) SQLJudge.ensureLoaded();
  document.getElementById('btn-run-sample').addEventListener('click', function () { runTask(id, mock, ti, false); });
  document.getElementById('btn-run-all').addEventListener('click', function () { runTask(id, mock, ti, true); });
}
function scrapeRun() {
  var cards = document.querySelectorAll('#judge-list .tc-card');
  var total = cards.length, passed = 0;
  cards.forEach(function (c) {
    if (c.querySelector('.tc-badge.pass')) passed++;
  });
  return { passed: passed, total: total };
}
function runTask(id, mock, ti, all) {
  var t = mock.coding.tasks[ti];
  persistCodeEditor(id, mock, ti);
  var done = function () {
    var r = scrapeRun();
    var st = codeStore(id);
    st.cur.coding[t.kind + 'Run'] = r;
    persistMock(id, st.cur);
  };
  if (t.kind === 'dsa') {
    if (!window.Judge) return;
    var r = Judge.run(t.problem, all);
    if (r && r.then) r.then(done); else setTimeout(done, 500);
  } else {
    if (!window.SQLJudge) return;
    var r2 = SQLJudge.run(t.problem, all);
    if (r2 && r2.then) r2.then(done); else setTimeout(done, 500);
  }
}
function submitCoding(id, mock, auto) {
  var s = codeStore(id);
  if (s.cur.coding.submitted) return;
  if (!auto && !confirm('Submit Coding? Sample runs will be locked into the report.')) return;
  s.cur.coding.submitted = true;
  s.cur.coding.at = Date.now();
  persistMock(id, s.cur);
  vCodingReview(id);
}
function vCodingReview(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    if (!s.cur.coding || !s.cur.coding.submitted) { vCoding(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Coding Review';
    var c = s.cur.coding;
    var html = '<div class="page-content"><div class="report-card"><h2>Coding result (sample runs)</h2>'
      + '<table class="split-table"><tr><th>Task</th><th>Result</th><th>Status</th></tr>'
      + mock.coding.tasks.map(function (t, k) {
        var st = taskStatus(id, mock, k);
        return '<tr><td>' + esc(t.kind.toUpperCase()) + ' — ' + esc(t.title || (t.problem || {}).title || t.ref || '') + '</td>'
          + '<td>' + esc(st.label) + '</td>'
          + '<td>' + (st.cls === 'ready' ? '<span class="pill ready">SOLVED</span>'
            : st.cls === 'soon' ? '<span class="pill soon">PARTIAL</span>' : '<span class="pill">OPEN</span>') + '</td></tr>';
      }).join('') + '</table>'
      + '<p class="text-muted">Hidden tests are not executed in mocks — sample runs decide solved/partial. '
      + 'AXIS clearing needs all test cases on ≥ 1 problem; treat full-sample as solved.</p></div>'
      + '<div class="row-flex"><a class="btn btn-primary btn-sm" href="#/' + id + '">Back to ' + esc(mock.title) + '</a>'
      + '<a class="btn btn-outline btn-sm" href="#/' + id + '/report">Combined report</a></div></div>';
    setContent(html);
  });
}

/* ---------- combined report ---------- */
function solvedTasks(id, mock) {
  var n = 0;
  mock.coding.tasks.forEach(function (_, k) {
    if (taskStatus(id, mock, k).cls === 'ready') n++;
  });
  return n;
}
function vReport(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    var tech = s.cur.technical;
    if (!tech || !tech.submitted) { location.hash = '#/' + id; return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Combined Report';
    var pct = Math.round(tech.score / mock.technical.totalMarks * 100);
    var gr = grade(pct);
    var techOk = tech.score >= TECH_PASS;
    var c = s.cur.coding || {};
    var nSolved = (c.submitted) ? solvedTasks(id, mock) : 0;
    var codeOk = c.submitted && nSolved >= 1;
    var clear = techOk && codeOk;
    var st = mockState(id);
    st.cur.report = { cleared: clear, at: Date.now() };
    persistMock(id, st.cur);
    renderSidebar();
    var html = '<div class="page-content"><div class="report-card"><div class="row-flex">'
      + '<span class="grade-big" style="color:' + gr.c + '">' + gr.g + '</span><div>'
      + '<h2>' + esc(mock.title) + ' — Technical ' + tech.score + '/45 (' + pct + '%)</h2>'
      + '<p class="text-muted">Correct ' + tech.correct + ' · Blank ' + blankCount(tech) + ' · No negative marking</p>'
      + '<p>Technical (≥ ' + TECH_PASS + '): ' + (techOk ? '<span class="verdict-clear">CLEARED</span>' : '<span class="verdict-fail">NOT CLEARED</span>') + ' · '
      + 'Coding (≥ 1 solved): ' + (!c.submitted ? '<span class="text-muted">not submitted</span>'
        : codeOk ? '<span class="verdict-clear">CLEARED (' + nSolved + '/3)</span>' : '<span class="verdict-fail">NOT CLEARED (' + nSolved + '/3)</span>') + '</p>'
      + '<h2 class="' + (clear ? 'verdict-clear' : 'verdict-fail') + '">MOCK ' + (clear ? 'CLEARED ✓' : 'NOT CLEARED') + '</h2>'
      + (!clear ? '<p class="text-muted">' + (!techOk ? 'Push Technical to ' + TECH_PASS + '+ first. ' : '')
        + (!codeOk ? 'Solve at least one coding task fully on samples.' : '') + '</p>' : '')
      + '</div></div></div>'
      + '<div class="row-flex"><a class="btn btn-outline btn-sm" href="#/' + id + '/technical">Technical detail</a>'
      + '<a class="btn btn-outline btn-sm" href="#/' + id + '/coding">Coding detail</a>'
      + '<a class="btn btn-ghost btn-sm" href="#/' + id + '">Back</a></div></div>';
    setContent(html);
  });
}

/* ---------- router ---------- */
function route() {
  var h = location.hash || '#/';
  var m = h.match(/^#\/(accenture-mock-\d+)(?:\/(technical|coding|report))?$/);
  loadManifest(function () {
    renderSidebar();
    if (!m) { vDashboard(); return; }
    var id = m[1], tab = m[2];
    var t = (manifest.topics || []).filter(function (x) { return x.id === id; })[0];
    if (!t || t.status !== 'ready') { vDashboard(); return; }
    if (tab === 'technical') {
      var s = mockState(id);
      if (s.cur.technical && s.cur.technical.submitted) vTechnicalReport(id); else vTechnical(id);
    }
    else if (tab === 'coding') {
      var s2 = mockState(id);
      if (s2.cur.coding && s2.cur.coding.submitted) vCodingReview(id); else vCoding(id);
    }
    else if (tab === 'report') vReport(id);
    else vMockHome(id);
  });
}

function bindChrome() {
  document.getElementById('hamburger').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });
  document.getElementById('menu-toggle').addEventListener('click', function () {
    document.getElementById('sidebar').classList.toggle('open');
  });
  var cb = document.getElementById('sidebar-close');
  if (cb) cb.addEventListener('click', closeSidebar);
  document.getElementById('back-button').addEventListener('click', function () { history.back(); });
  var dark = localStorage.getItem('aptitudeDarkMode') === 'true';
  document.documentElement.classList.toggle('dark', dark);
  document.getElementById('theme-toggle').addEventListener('click', function () {
    dark = !dark;
    localStorage.setItem('aptitudeDarkMode', String(dark));
    document.documentElement.classList.toggle('dark', dark);
  });
  window.addEventListener('hashchange', route);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { bindChrome(); route(); });
else { bindChrome(); route(); }
})();
