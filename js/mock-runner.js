/* ApArena Veda Mock Runner — timed blind-attempt Prelims + written Mains with graded reports.
   ponytail: single-file exam engine, no deps beyond KaTeX + style.css. Answers stay hidden until submit. */
(function () {
'use strict';

var LS_KEY = 'veda-mocks-v1';
var MANIFEST_URL = '/data/veda-mocks.json';
var MOCK_URL = function (id) { return '/data/topics/' + id + '.json'; };

var manifest = null;
var mockCache = {};
var timerId = null;
var timerLeft = 0;
var prelimsIdx = 0;

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
function math(s) { return esc(s); } // KaTeX auto-render handles $..$ after inject
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
  } catch (e) { /* math is progressive enhancement */ }
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
function normFill(s) {
  return String(s == null ? '' : s).toLowerCase().trim().replace(/[\s_]+/g, '');
}
function flatPrelims(mock) {
  var out = [];
  mock.prelims.sections.forEach(function (sec) {
    sec.questions.forEach(function (q) {
      out.push({ sec: sec.title, q: q });
    });
  });
  return out;
}

/* ---------- data ---------- */
function loadManifest(cb) {
  if (manifest) return cb(manifest);
  fetch(MANIFEST_URL, { cache: 'default' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (j) { manifest = j; renderSidebar(); cb(j); })
  .catch(function () {
    setContent('<div class="page-content"><div class="empty-state">Could not load the mocks bank. Check /data/veda-mocks.json.</div></div>');
  });
}
function loadMock(id, cb) {
  if (mockCache[id]) return cb(mockCache[id]);
  fetch(MOCK_URL(id), { cache: 'default' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }).then(function (j) { mockCache[id] = j; cb(j); })
  .catch(function () {
    setContent('<div class="page-content"><div class="empty-state">Mock data not found yet — mocks release one at a time.</div></div>');
  });
}

/* ---------- sidebar / chrome ---------- */
function renderSidebar() {
  var nav = document.getElementById('sidebar-nav');
  if (!nav || !manifest) return;
  var st = getStore();
  var topics = manifest.topics || [];
  var done = topics.filter(function (t) { return st[t.id] && st[t.id].prelims && st[t.id].prelims.submitted; }).length;
  var html = '<div class="sidebar-section-label">Mock Series</div>';
  topics.forEach(function (t) {
    var ready = (t.status || '') === 'ready';
    var s = st[t.id] || {};
    var dot = (s.prelims && s.prelims.submitted) ? '#10B981' : ready ? '#F59E0B' : '#CBD5E1';
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
  var pct = topics.length ? Math.round(done / topics.length * 100) : 0;
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
  document.getElementById('header-title').textContent = 'Veda Mock Tests';
  var st = getStore();
  var topics = manifest.topics || [];
  var html = '<div class="page-content"><h1 class="text-2xl fw-700">Mock Test Series — Exact VEDA Pattern</h1>'
    + '<p class="text-muted">Each mock: <strong>Prelims 30M / 60 min</strong> (30×1M MCQ, −0.25 wrong) + '
    + '<strong>Mains 70M / 120 min</strong> (10 fill-blanks + 12 short answers + 10 problems, no negative). '
    + 'Answers stay hidden until you submit; the graded report unlocks after.</p>'
    + '<div class="mock-grid">';
  topics.forEach(function (t, i) {
    var ready = (t.status || '') === 'ready';
    var s = st[t.id] || {};
    var pre = s.prelims && s.prelims.submitted ? ('Prelims ' + s.prelims.score.toFixed(2).replace(/\.?0+$/, '') + '/30') : 'not attempted';
    var main = s.mains && s.mains.finalized ? ('Mains ' + s.mains.total + '/70') : 'not attempted';
    html += '<div class="mock-card' + (ready ? '' : ' locked') + '">'
      + '<div class="row-flex"><strong>' + esc(t.title) + '</strong>'
      + '<span class="pill ' + (ready ? 'ready' : 'soon') + '">' + (ready ? 'READY' : 'SOON') + '</span></div>'
      + '<p class="text-muted">' + esc((t.subtopics || []).join(' · ')) + '</p>'
      + '<p class="text-muted">' + esc(pre) + ' · ' + esc(main) + '</p>'
      + (ready
        ? '<button class="btn btn-primary btn-sm" data-open="' + esc(t.id) + '">' + (s.prelims && s.prelims.submitted ? 'Open / Review' : 'Start Mock ' + (i + 1)) + '</button>'
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
function vMockHome(id) {
  loadMock(id, function (mock) {
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title;
    var ms = mockState(id).cur;
    var pre = ms.prelims, mn = ms.mains;
    function preLine() {
      if (pre && pre.submitted) return 'Submitted — ' + Number(pre.score).toFixed(2).replace(/\.?0+$/, '') + '/30';
      if (pre && pre.answers && pre.answers.some(function (a) { return a !== null && a !== undefined; })) return 'In progress';
      return 'Not started';
    }
    function mainLine() {
      if (mn && mn.finalized) return 'Finalized — ' + mn.total + '/70';
      if (mn && mn.submitted) return 'Awaiting self-scoring';
      return 'Not started';
    }
    var html = '<div class="page-content">'
      + '<h1 class="text-2xl fw-700">' + esc(mock.title) + ' — Prelims + Mains</h1>'
      + '<p class="text-muted">Prelims: 30×1M MCQ, 60 min, −0.25 per wrong answer. Mains: 10×1M fill + 12×2M short + 10 problems (3/4M), 120 min, no negative.</p>'
      + '<div class="report-card"><h3>Prelims (30M)</h3><p>' + esc(preLine()) + '</p><div class="row-flex">'
      + (pre && pre.submitted
        ? '<a class="btn btn-outline btn-sm" href="#/' + id + '/prelims">Review report</a><button class="btn btn-ghost btn-sm" id="retake-pre">Retake</button>'
        : '<a class="btn btn-primary btn-sm" href="#/' + id + '/prelims">' + (preLine() === 'In progress' ? 'Continue' : 'Start Prelims') + '</a>')
      + '</div></div>'
      + '<div class="report-card"><h3>Mains (70M)</h3><p>' + esc(mainLine()) + '</p><div class="row-flex">'
      + '<a class="btn btn-primary btn-sm" href="#/' + id + '/mains">' + (mn && (mn.submitted || mn.finalized) ? 'Open / Review' : 'Start Mains') + '</a>'
      + '</div></div>'
      + ((pre && pre.submitted)
        ? '<a class="btn btn-primary" href="#/' + id + '/report">Combined report (/100)</a>'
        : '<p class="text-muted">Combined report unlocks after Prelims is submitted.</p>')
      + '</div>';
    setContent(html);
    var rt = document.getElementById('retake-pre');
    if (rt) rt.addEventListener('click', function () {
      if (!confirm('Retake Prelims? Previous score will be replaced.')) return;
      var s = mockState(id); delete s.cur.prelims; persistMock(id, s.cur);
      location.hash = '#/' + id + '/prelims';
    });
  });
}

/* ---------- prelims exam ---------- */
function startPrelimsTimer(id, mock) {
  stopTimer();
  window.onbeforeunload = function () { return 'Exam in progress — leaving may lose your timer.'; };
  timerId = setInterval(function () {
    timerLeft--;
    var el = document.getElementById('mock-clock');
    if (el) {
      el.textContent = fmtTime(timerLeft);
      if (timerLeft < 300) el.parentElement.classList.add('danger');
    }
    if (timerLeft <= 0) {
      submitPrelims(id, mock, true);
    }
  }, 1000);
}
function vPrelims(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    if (s.cur.prelims && s.cur.prelims.submitted) { vPrelimsReport(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Prelims';
    if (!s.cur.prelims) s.cur.prelims = { answers: [], startedAt: Date.now() };
    var cur = s.cur.prelims;
    var flat = flatPrelims(mock);
    while (cur.answers.length < flat.length) cur.answers.push(null);
    persistMock(id, s.cur);
    prelimsIdx = 0;
    timerLeft = mock.prelims.durationMin * 60;
    renderPrelimsQ(id, mock);
    startPrelimsTimer(id, mock);
  });
}
function renderPrelimsQ(id, mock) {
  var s = mockState(id);
  var cur = s.cur.prelims;
  var flat = flatPrelims(mock);
  var i = Math.min(prelimsIdx, flat.length - 1);
  prelimsIdx = i;
  var item = flat[i];
  var answered = cur.answers.filter(function (a) { return a !== null && a !== undefined; }).length;
  var html = '<div class="page-content">'
    + '<div class="mock-timer"><span> Prelims — 30M · 60 min · −0.25 wrong</span>'
    + '<span class="clock" id="mock-clock">' + fmtTime(timerLeft) + '</span>'
    + '<span class="text-muted">' + answered + '/30 answered</span>'
    + '<span style="flex:1"></span><button class="btn btn-primary btn-sm" id="pre-submit">Submit Prelims</button></div>'
    + '<div class="palette">' + flat.map(function (f, k) {
      return '<button data-jump="' + k + '" class="' + (cur.answers[k] !== null && cur.answers[k] !== undefined ? 'ans' : '') + (k === i ? ' cur' : '') + '">' + (k + 1) + '</button>';
    }).join('') + '</div>'
    + '<div class="exam-q"><div class="q-head"><span class="q-num">Q' + (i + 1) + '/30</span>'
    + '<span class="pill">' + esc(item.sec) + '</span><span class="pill">1M</span></div>'
    + '<div>' + math(item.q.q) + '</div>'
    + '<div class="mcq-options">' + item.q.opts.map(function (o, oi) {
      return '<button class="mcq-option' + (cur.answers[i] === oi ? ' opt-picked' : '') + '" data-opt="' + oi + '">'
        + '<span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>'
        + '<span class="option-text">' + math(o) + '</span></button>';
    }).join('') + '</div></div>'
    + '<div class="row-flex"><button class="btn btn-outline btn-sm" id="pre-prev"' + (i === 0 ? ' disabled' : '') + '>Prev</button>'
    + '<button class="btn btn-outline btn-sm" id="pre-next"' + (i === flat.length - 1 ? ' disabled' : '') + '>Next</button>'
    + '<button class="btn btn-ghost btn-sm" id="pre-clear">Clear answer</button></div></div>';
  // NOTE: direct innerHTML (not setContent) so the countdown keeps running
  var el = document.getElementById('app-content');
  el.innerHTML = html;
  renderMath();
  window.scrollTo(0, 0);
  el.querySelectorAll('[data-opt]').forEach(function (b) {
    b.addEventListener('click', function () {
      var st2 = mockState(id);
      st2.cur.prelims.answers[i] = parseInt(b.getAttribute('data-opt'), 10);
      persistMock(id, st2.cur);
      renderPrelimsQ(id, mock);
    });
  });
  el.querySelectorAll('[data-jump]').forEach(function (b) {
    b.addEventListener('click', function () {
      prelimsIdx = parseInt(b.getAttribute('data-jump'), 10);
      renderPrelimsQ(id, mock);
    });
  });
  document.getElementById('pre-prev').addEventListener('click', function () { prelimsIdx = Math.max(0, i - 1); renderPrelimsQ(id, mock); });
  document.getElementById('pre-next').addEventListener('click', function () { prelimsIdx = Math.min(flat.length - 1, i + 1); renderPrelimsQ(id, mock); });
  document.getElementById('pre-clear').addEventListener('click', function () {
    var st3 = mockState(id); st3.cur.prelims.answers[i] = null; persistMock(id, st3.cur); renderPrelimsQ(id, mock);
  });
  document.getElementById('pre-submit').addEventListener('click', function () { submitPrelims(id, mock, false); });
}
function submitPrelims(id, mock, auto) {
  var s = mockState(id);
  var cur = s.cur.prelims;
  if (!cur || cur.submitted) return;
  var flat = flatPrelims(mock);
  var un = cur.answers.filter(function (a) { return a === null || a === undefined; }).length;
  if (!auto) {
    if (!confirm('Submit Prelims? ' + un + ' unanswered. Answers will be revealed in the report.')) return;
  }
  var correct = 0, wrong = 0;
  flat.forEach(function (f, k) {
    var a = cur.answers[k];
    if (a === null || a === undefined) return;
    if (a === f.q.c) correct++; else wrong++;
  });
  var score = correct * mock.prelims.correctMarks - wrong * mock.prelims.negative;
  cur.submitted = true;
  cur.correct = correct; cur.wrong = wrong;
  cur.score = Math.round(score * 100) / 100;
  cur.at = Date.now();
  persistMock(id, s.cur);
  renderSidebar();
  vPrelimsReport(id); // direct call: hash is unchanged so no hashchange fires
}
function vPrelimsReport(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    var cur = s.cur.prelims;
    if (!cur || !cur.submitted) { vPrelims(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Prelims Report';
    var flat = flatPrelims(mock);
    var pct = Math.max(0, Math.round(cur.score / mock.prelims.totalMarks * 100));
    var gr = grade(pct);
    var split = {};
    flat.forEach(function (f, k) {
      split[f.sec] = split[f.sec] || { n: 0, ok: 0 };
      split[f.sec].n++;
      if (cur.answers[k] === f.q.c) split[f.sec].ok++;
    });
    var html = '<div class="page-content"><div class="report-card"><div class="row-flex">'
      + '<span class="grade-big" style="color:' + gr.c + '">' + gr.g + '</span>'
      + '<div><h2>Prelims: ' + esc(String(Number(cur.score).toFixed(2).replace(/\.?0+$/, ''))) + ' / ' + mock.prelims.totalMarks + '</h2>'
      + '<p class="text-muted">Correct ' + cur.correct + ' · Wrong ' + cur.wrong + ' · Blank ' + (flat.length - cur.correct - cur.wrong)
      + ' · ' + pct + '% (negative −' + mock.prelims.negative + ' per wrong)</p>'
      + '<p class="text-muted">' + Object.keys(split).map(function (k) { return esc(k) + ' ' + split[k].ok + '/' + split[k].n; }).join(' · ') + '</p></div>'
      + '</div></div>';
    flat.forEach(function (f, k) {
      var a = cur.answers[k];
      var ok = a === f.q.c;
      html += '<div class="exam-q' + (a === null || a === undefined ? '' : ok ? ' rev-correct' : ' rev-wrong') + '">'
        + '<div class="q-head"><span class="q-num">Q' + (k + 1) + '</span><span class="pill">' + esc(f.sec) + '</span>'
        + '<span class="pill">' + (a === null || a === undefined ? 'blank' : ok ? 'correct +1' : 'wrong −' + mock.prelims.negative) + '</span></div>'
        + '<div>' + math(f.q.q) + '</div>'
        + '<div class="mcq-options">' + f.q.opts.map(function (o, oi) {
          var cls = 'mcq-option' + (oi === f.q.c ? ' correct' : (a === oi ? ' wrong' : ''));
          return '<button class="' + cls + '" disabled><span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>'
            + '<span class="option-text">' + math(o) + '</span></button>';
        }).join('') + '</div>'
        + '<div class="model-ans"><strong>Answer: ' + String.fromCharCode(65 + f.q.c) + '</strong>'
        + (f.q.exp ? f.q.exp.map(function (e) { return '<div>' + math(e) + '</div>'; }).join('') : '')
        + '</div></div>';
    });
    html += '<div class="row-flex"><a class="btn btn-primary btn-sm" href="#/' + id + '">Back to ' + esc(mock.title) + '</a></div></div>';
    setContent(html);
  });
}

/* ---------- mains exam ---------- */
function startMainsTimer(id, mock) {
  stopTimer();
  timerLeft = mock.mains.durationMin * 60;
  window.onbeforeunload = function () { return 'Mains in progress — leaving may lose your timer.'; };
  timerId = setInterval(function () {
    timerLeft--;
    var el = document.getElementById('mock-clock');
    if (el) {
      el.textContent = fmtTime(timerLeft);
      if (timerLeft < 300) el.parentElement.classList.add('danger');
    }
    if (timerLeft <= 0) submitMains(id, mock, true);
  }, 1000);
}
function vMains(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    if (s.cur.mains && s.cur.mains.submitted) { vMainsScore(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Mains';
    if (!s.cur.mains) s.cur.mains = { fills: {}, rough: {} };
    persistMock(id, s.cur);
    var cur = s.cur.mains;
    var html = '<div class="page-content">'
      + '<div class="mock-timer"><span>Mains — 70M · 120 min · no negative</span>'
      + '<span class="clock" id="mock-clock">' + fmtTime(mock.mains.durationMin * 60) + '</span>'
      + '<span style="flex:1"></span><button class="btn btn-primary btn-sm" id="main-submit">Submit Mains</button></div>'
      + '<p class="text-muted">Write fill-in-the-blank answers in the boxes. For short answers and problems, use the rough boxes for your working — model answers and self-scoring unlock after you submit.</p>';
    mock.mains.sections.forEach(function (sec) {
      html += '<h2>' + esc(sec.title) + ' <span class="text-muted">(' + sec.kind + ')</span></h2>';
      sec.questions.forEach(function (q, qi) {
        var qn = sec.id + (qi + 1);
        html += '<div class="exam-q"><div class="q-head"><span class="q-num">' + esc(qn) + '</span>'
          + '<span class="pill">' + esc(q.subject) + '</span><span class="pill">' + q.marks + 'M</span></div>'
          + '<div>' + math(q.q) + '</div>';
        if (sec.kind === 'fill') {
          html += '<input class="fill-input" data-fill="' + esc(q.id) + '" placeholder="Your answer" value="' + esc(cur.fills[q.id] || '') + '">';
        } else {
          html += '<textarea class="rough" data-rough="' + esc(q.id) + '" placeholder="Your working / answer (self-marked after submit)">' + esc(cur.rough[q.id] || '') + '</textarea>';
        }
        html += '</div>';
      });
    });
    html += '<button class="btn btn-primary" id="main-submit2">Submit Mains</button></div>';
    var el = document.getElementById('app-content');
    stopTimer();
    el.innerHTML = html;
    renderMath();
    window.scrollTo(0, 0);
    timerLeft = mock.mains.durationMin * 60;
    // resume note: mains timer restarts full on revisit; answers persist
    startMainsTimerKeep(id, mock);
    el.querySelectorAll('[data-fill]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        var st2 = mockState(id); st2.cur.mains.fills[inp.getAttribute('data-fill')] = inp.value; persistMock(id, st2.cur);
      });
    });
    el.querySelectorAll('[data-rough]').forEach(function (ta) {
      ta.addEventListener('input', function () {
        var st3 = mockState(id); st3.cur.mains.rough[ta.getAttribute('data-rough')] = ta.value; persistMock(id, st3.cur);
      });
    });
    document.getElementById('main-submit').addEventListener('click', function () { submitMains(id, mock, false); });
    document.getElementById('main-submit2').addEventListener('click', function () { submitMains(id, mock, false); });
  });
}
function startMainsTimerKeep(id, mock) {
  window.onbeforeunload = function () { return 'Mains in progress — leaving may lose your timer.'; };
  timerId = setInterval(function () {
    timerLeft--;
    var el = document.getElementById('mock-clock');
    if (el) {
      el.textContent = fmtTime(timerLeft);
      if (timerLeft < 300) el.parentElement.classList.add('danger');
    }
    if (timerLeft <= 0) submitMains(id, mock, true);
  }, 1000);
}
function submitMains(id, mock, auto) {
  var s = mockState(id);
  var cur = s.cur.mains;
  if (!cur || cur.submitted) return;
  if (!auto && !confirm('Submit Mains? Model answers will be revealed for self-scoring.')) return;
  cur.submitted = true;
  cur.at = Date.now();
  // auto-grade fills now
  var fs = 0;
  mock.mains.sections.forEach(function (sec) {
    if (sec.kind !== 'fill') return;
    sec.questions.forEach(function (q) {
      var given = normFill(cur.fills[q.id]);
      var ok = (q.accept || []).some(function (a) { return normFill(a) === given; });
      if (ok) fs += q.marks;
    });
  });
  cur.fillScore = fs;
  if (!cur.self) cur.self = {};
  persistMock(id, s.cur);
  vMainsScore(id); // direct call: hash is unchanged so no hashchange fires
}
function vMainsScore(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    var cur = s.cur.mains;
    if (!cur || !cur.submitted) { vMains(id); return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Mains Scoring';
    var html = '<div class="page-content">'
      + '<div class="report-card"><h2>Mains self-scoring</h2>'
      + '<p>Fill-blanks auto-scored: <strong>' + cur.fillScore + ' / 10</strong>. Compare your working with each model answer, enter your marks honestly (0–max, halves allowed), then Finalize.</p></div>';
    mock.mains.sections.forEach(function (sec) {
      html += '<h2>' + esc(sec.title) + '</h2>';
      sec.questions.forEach(function (q, qi) {
        var qn = sec.id + (qi + 1);
        html += '<div class="exam-q"><div class="q-head"><span class="q-num">' + esc(qn) + '</span>'
          + '<span class="pill">' + esc(q.subject) + '</span><span class="pill">' + q.marks + 'M</span></div>'
          + '<div>' + math(q.q) + '</div>';
        if (sec.kind === 'fill') {
          var given = normFill(cur.fills[q.id]);
          var ok = (q.accept || []).some(function (a) { return normFill(a) === given; });
          html += '<p>Your answer: <strong>' + esc(cur.fills[q.id] || '—') + '</strong> — '
            + (ok ? '<span style="color:#10B981">correct (+' + q.marks + ')</span>' : '<span style="color:#EF4444">wrong (0)</span>') + '</p>';
        } else if (cur.rough[q.id]) {
          html += '<p class="text-muted">Your working: ' + esc(cur.rough[q.id]).slice(0, 400) + '</p>';
        }
        html += '<div class="model-ans"><strong>Model answer:</strong><div>' + math(q.model) + '</div>'
          + (q.scheme ? '<div class="text-muted">Marking: ' + esc(q.scheme.join(' · ')) + '</div>' : '')
          + (q.exp ? '<div>' + math(q.exp) + '</div>' : '') + '</div>';
        if (sec.kind !== 'fill') {
          var v = (cur.self && cur.self[q.id] !== undefined) ? cur.self[q.id] : '';
          html += '<p>Your marks (0–' + q.marks + '): <input class="score-input" type="number" min="0" max="' + q.marks + '" step="0.5" data-self="' + esc(q.id) + '" data-max="' + q.marks + '" value="' + esc(String(v)) + '"></p>';
        }
        html += '</div>';
      });
    });
    html += '<div class="row-flex"><button class="btn btn-primary" id="finalize">Finalize Mains Score</button>'
      + '<a class="btn btn-ghost btn-sm" href="#/' + id + '">Back</a></div></div>';
    setContent(html);
    document.getElementById('finalize').addEventListener('click', function () {
      var st2 = mockState(id);
      var total = st2.cur.mains.fillScore || 0;
      var bad = [];
      document.querySelectorAll('[data-self]').forEach(function (inp) {
        var mx = parseFloat(inp.getAttribute('data-max'));
        var val = parseFloat(inp.value);
        if (isNaN(val)) { bad.push(inp.getAttribute('data-self')); return; }
        val = Math.max(0, Math.min(mx, Math.round(val * 2) / 2));
        st2.cur.mains.self[inp.getAttribute('data-self')] = val;
        total += val;
      });
      if (bad.length) { alert('Enter marks (0–max) for every short/problem question before finalizing.'); return; }
      st2.cur.mains.total = Math.round(total * 2) / 2;
      st2.cur.mains.finalized = true;
      persistMock(id, st2.cur);
      renderSidebar();
      location.hash = '#/' + id + '/report';
    });
  });
}

/* ---------- combined report ---------- */
function vReport(id) {
  loadMock(id, function (mock) {
    var s = mockState(id);
    var pre = s.cur.prelims, mn = s.cur.mains;
    if (!pre || !pre.submitted) { location.hash = '#/' + id; return; }
    updateBack(true);
    document.getElementById('header-title').textContent = mock.title + ' — Combined Report';
    var mainTotal = (mn && mn.finalized) ? mn.total : null;
    var grand = mainTotal === null ? null : Math.round((pre.score + mainTotal) * 100) / 100;
    var pct = grand === null ? Math.max(0, Math.round(pre.score / 30 * 100)) : Math.max(0, Math.round(grand / 100 * 100));
    var gr = grade(pct);
    var html = '<div class="page-content"><div class="report-card"><div class="row-flex">'
      + '<span class="grade-big" style="color:' + gr.c + '">' + gr.g + '</span><div>'
      + '<h2>' + esc(mock.title) + ' — ' + (grand === null ? esc(String(Number(pre.score).toFixed(2).replace(/\.?0+$/, ''))) + ' / 30 (Prelims only)' : esc(String(grand)) + ' / 100') + '</h2>'
      + '<p class="text-muted">Prelims ' + esc(String(Number(pre.score).toFixed(2).replace(/\.?0+$/, ''))) + '/30 (correct ' + pre.correct + ', wrong ' + pre.wrong + ')'
      + (mainTotal === null ? ' · Mains not finalized yet' : ' · Mains ' + mainTotal + '/70 (fill ' + mn.fillScore + '/10 + written ' + (mainTotal - mn.fillScore) + '/60)') + '</p>'
      + '</div></div></div>'
      + '<div class="row-flex"><a class="btn btn-outline btn-sm" href="#/' + id + '/prelims">Prelims detail</a>'
      + '<a class="btn btn-outline btn-sm" href="#/' + id + '/mains">Mains detail</a>'
      + '<a class="btn btn-ghost btn-sm" href="#/' + id + '">Back</a></div></div>';
    setContent(html);
  });
}

/* ---------- router ---------- */
function route() {
  var h = location.hash || '#/';
  var m = h.match(/^#\/(veda-mock-\d+)(?:\/(prelims|mains|report))?$/);
  loadManifest(function () {
    renderSidebar();
    if (!m) { vDashboard(); return; }
    var id = m[1], tab = m[2];
    var t = (manifest.topics || []).filter(function (x) { return x.id === id; })[0];
    if (!t || t.status !== 'ready') { vDashboard(); return; }
    if (tab === 'prelims') {
      var s = mockState(id);
      if (s.cur.prelims && s.cur.prelims.submitted) vPrelimsReport(id); else vPrelims(id);
    }
    else if (tab === 'mains') {
      var s2 = mockState(id);
      if (s2.cur.mains && s2.cur.mains.submitted) vMainsScore(id); else vMains(id);
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
