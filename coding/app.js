/* ApArena Coding Arena — problem list + IDE */
(function () {
  'use strict';

  var PROBLEMS = [];
  var state = {
    view: 'home',
    problemId: null,
    stmtTab: 'problem',
    filterDiff: 'all',
    filterTopic: 'all',
    solved: JSON.parse(localStorage.getItem('arena-solved') || '{}'),
    dark: localStorage.getItem('arena-dark') === '1'
  };

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function setContent(html) { $('app-content').innerHTML = html; window.scrollTo(0, 0); }
  function toast(msg, kind) {
    var c = $('toast-container');
    var t = document.createElement('div');
    t.className = 'toast ' + (kind || 'info');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; }, 2400);
    setTimeout(function () { t.remove(); }, 2900);
  }
  function saveSolved() { localStorage.setItem('arena-solved', JSON.stringify(state.solved)); updateSidebarProgress(); }

  function applyTheme() {
    document.documentElement.classList.toggle('dark', state.dark);
    $('theme-toggle').innerHTML = state.dark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9.36 9.36 0 1 1 11.21 3 7.36 7.36 0 0 0 21 12.79z"/></svg>';
  }

  function renderSidebar() {
    var html = '<div class="sidebar-section-label">Coding Arena</div>' +
      '<button class="sidebar-item' + (state.view === 'home' ? ' active' : '') + '" data-go="home">' +
      '<span class="sidebar-item-icon">&#8962;</span><span class="sidebar-item-text">Problems</span></button>' +
      '<div class="sidebar-section-label">All Problems</div>';
    PROBLEMS.forEach(function (p, i) {
      html += '<button class="sidebar-item' + (state.problemId === p.id ? ' active' : '') + '" data-open="' + p.id + '">' +
        '<span class="sidebar-item-icon" style="font-size:10px">' + (i + 1) + '</span>' +
        '<span class="sidebar-item-text">' + esc(p.title) + '</span>' +
        (state.solved[p.id] ? '<span class="solved-dot"></span>' : '') +
        '</button>';
    });
    $('sidebar-nav').innerHTML = html;
    $('sidebar-nav').querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { ARENA.go('home'); closeSidebar(); });
    });
    $('sidebar-nav').querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { ARENA.open(b.getAttribute('data-open')); closeSidebar(); });
    });
    updateSidebarProgress();
  }
  function updateSidebarProgress() {
    var done = PROBLEMS.filter(function (p) { return state.solved[p.id]; }).length;
    var fill = $('sidebar-progress-fill');
    if (fill) fill.style.width = (PROBLEMS.length ? Math.round(done / PROBLEMS.length * 100) : 0) + '%';
    var txt = $('sidebar-progress-text');
    if (txt) txt.textContent = done + ' / ' + PROBLEMS.length;
  }
  function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('sidebar-overlay').classList.remove('active');
  }

  // ---------- home: LeetCode-style problem table ----------
  function renderHome() {
    state.view = 'home'; state.problemId = null;
    $('header-title').textContent = 'Coding Arena';
    $('back-button').hidden = true;
    renderSidebar();

    var solvedCount = PROBLEMS.filter(function (p) { return state.solved[p.id]; }).length;
    var html =
      '<div class="arena-home">' +
        '<div class="arena-head">' +
          '<h1>Problems</h1>' +
          '<span class="progress-pill">' + solvedCount + ' / ' + PROBLEMS.length + ' solved</span>' +
        '</div>' +
        '<div class="arena-filters" id="arena-filters"></div>' +
        '<div class="problem-table" id="problem-table"></div>' +
      '</div>';

    setContent(html);
    renderFilters();
    renderTable();
  }

  function renderFilters() {
    var diffs = ['all', 'easy', 'medium', 'hard'];
    var topicSet = {};
    PROBLEMS.forEach(function (p) { topicSet[p.topic] = 1; });
    var topics = Object.keys(topicSet).sort();
    var html = diffs.map(function (d) {
      return '<button class="' + (state.filterDiff === d ? 'active' : '') + '" data-fdiff="' + d + '">' + (d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1)) + '</button>';
    }).join('');
    html += '<span class="sep"></span>';
    html += '<button class="' + (state.filterTopic === 'all' ? 'active' : '') + '" data-ftopic="all">All topics</button>';
    html += topics.map(function (t) {
      return '<button class="' + (state.filterTopic === t ? 'active' : '') + '" data-ftopic="' + esc(t) + '">' + esc(t) + '</button>';
    }).join('');
    $('arena-filters').innerHTML = html;
    $('arena-filters').querySelectorAll('[data-fdiff]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterDiff = b.getAttribute('data-fdiff'); renderFilters(); renderTable(); });
    });
    $('arena-filters').querySelectorAll('[data-ftopic]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterTopic = b.getAttribute('data-ftopic'); renderFilters(); renderTable(); });
    });
  }

  function renderTable() {
    var list = PROBLEMS.filter(function (p) {
      return (state.filterDiff === 'all' || p.difficulty === state.filterDiff) &&
             (state.filterTopic === 'all' || p.topic === state.filterTopic);
    });
    var wrap = $('problem-table');
    if (!list.length) {
      wrap.innerHTML = '<div class="empty-state" style="padding:32px;text-align:center;color:var(--text-3)">No problems match the filter.</div>';
      return;
    }
    wrap.innerHTML = list.map(function (p) {
      var idx = PROBLEMS.indexOf(p) + 1;
      var solved = !!state.solved[p.id];
      return '<div class="problem-row' + (solved ? ' solved' : '') + '" data-open="' + p.id + '">' +
        '<div class="pr-num">' + (solved ? '✓' : String(idx).padStart(2, '0')) + '</div>' +
        '<div class="pr-title">' + (solved ? '<span class="pr-solved">✓</span>' : '') + '<span>' + esc(p.title) + '</span></div>' +
        '<div class="pr-topic">' + esc(p.topic) + '</div>' +
        '<div class="pr-approach">' + esc(p.approach || '') + '</div>' +
        '<div><span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span></div>' +
        '<div class="pr-arrow">›</div>' +
        '</div>';
    }).join('');
    wrap.querySelectorAll('[data-open]').forEach(function (row) {
      row.addEventListener('click', function () { ARENA.open(row.getAttribute('data-open')); });
    });
  }

  // ---------- problem view: 3-pane IDE ----------
  function stmtBody(p) {
    if (state.stmtTab === 'steps') {
      return '<div class="approach-box"><b>Approach — </b>' + esc(p.approach) + '</div>' +
        '<span class="stmt-label">Step-by-step</span>' +
        '<div class="steps-list">' + p.steps.map(function (s) { return '<div class="step">' + esc(s) + '</div>'; }).join('') + '</div>' +
        '<div class="complexity-box">Complexity: ' + esc(p.complexity) + '</div>';
    }
    if (state.stmtTab === 'solution') {
      var solved = state.solved[p.id];
      return '<div class="solution-reveal' + (solved ? '' : ' locked') + '" id="sol-wrap">' +
        '<span class="stmt-label">Reference solution</span>' +
        '<pre class="pseudocode-pre" style="border:1px solid var(--border);border-radius:10px">' + esc(p.solution) + '</pre>' +
        (solved ? '' : '<button class="reveal-btn" id="reveal-btn"><span>Reveal — click to unlock</span></button>') +
        '</div>' +
        '<div class="insight-box"><b>Pattern insight — </b>' + esc(p.insight) + '</div>';
    }
    var samplesHtml = p.samples.map(function (s, i) {
      return '<div class="sample-case"><div class="sc-head">Sample ' + (i + 1) + ' &mdash; Input</div><pre>' + esc(s.stdin.replace(/\n$/, '')) + '</pre>' +
        '<pre class="sc-out">Output &rarr; ' + esc(s.expected) + '</pre></div>';
    }).join('');
    return '<div class="stmt-title">' + esc(p.title) + '</div>' +
      '<div class="stmt-block">' + p.statement + '</div>' +
      '<span class="stmt-label">Input format</span><div class="stmt-io">' + p.inputFormat + '</div>' +
      '<span class="stmt-label">Output format</span><div class="stmt-io">' + p.outputFormat + '</div>' +
      '<span class="stmt-label">Constraints</span><div class="stmt-constraints">' + p.constraints + '</div>' +
      '<span class="stmt-label">Samples</span>' + samplesHtml;
  }

  function updateLines(ed) {
    var n = ed.value.split('\n').length;
    var out = '';
    for (var i = 1; i <= n; i++) out += i + '\n';
    $('editor-lines').textContent = out;
    $('editor-lines').scrollTop = ed.scrollTop;
  }

  function renderProblem() {
    var p = PROBLEMS.find(function (x) { return x.id === state.problemId; });
    if (!p) { ARENA.go('home'); return; }
    state.view = 'problem';
    $('header-title').textContent = p.title;
    $('back-button').hidden = false;
    renderSidebar();

    var html =
    '<div class="ide-wrap">' +
      '<div class="ide-bar">' +
        '<div class="ib-title">' + esc(p.title) + '</div>' +
        '<span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span>' +
        '<span class="ib-meta">' + esc(p.topic) + ' &middot; ' + p.tests.length + ' tests</span>' +
        '<div class="ib-spacer"></div>' +
        '<span class="ib-meta">Python 3 &middot; in-browser</span>' +
      '</div>' +
      '<div class="ide">' +
        '<div class="ide-pane">' +
          '<div class="ide-pane-head"><span class="pane-label">Problem</span>' +
            '<div class="stmt-tabs">' +
              '<button class="' + (state.stmtTab === 'problem' ? 'active' : '') + '" data-tab="problem">Description</button>' +
              '<button class="' + (state.stmtTab === 'steps' ? 'active' : '') + '" data-tab="steps">Approach</button>' +
              '<button class="' + (state.stmtTab === 'solution' ? 'active' : '') + '" data-tab="solution">Solution</button>' +
            '</div>' +
          '</div>' +
          '<div class="ide-pane-body" id="stmt-body">' + stmtBody(p) + '</div>' +
        '</div>' +
        '<div class="ide-pane">' +
          '<div class="ide-pane-head"><span class="pane-label">Code</span>' +
            '<button class="btn-run secondary" id="btn-reset" style="margin-left:auto;padding:5px 12px;font-size:11.5px">Reset</button>' +
          '</div>' +
          '<div class="editor-wrap">' +
            '<div class="editor-lines" id="editor-lines">1</div>' +
            '<textarea id="editor" spellcheck="false" autocomplete="off"></textarea>' +
          '</div>' +
          '<div class="editor-statusbar">' +
            '<button class="btn-run" id="btn-run-sample"><span>&#9654; Run sample</span></button>' +
            '<button class="btn-run" id="btn-run-all"><span>&#10003; Submit</span></button>' +
            '<span class="py-status" id="py-status">runtime: not loaded</span>' +
            '<span class="hint" style="margin-left:auto">Ctrl+Enter = run</span>' +
          '</div>' +
        '</div>' +
        '<div class="ide-pane">' +
          '<div class="ide-pane-head"><span class="pane-label">Test results</span>' +
            '<span class="ib-meta" style="margin-left:auto">' + p.tests.length + ' tests &middot; ' + p.samples.length + ' samples</span>' +
          '</div>' +
          '<div class="ide-pane-body" id="judge-body">' +
            '<div class="judge-summary idle" id="judge-summary">Run your code to see results.</div>' +
            '<div id="judge-list"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

    setContent(html);

    var ed = $('editor');
    ed.value = localStorage.getItem('arena-code-' + p.id) || p.starter;
    updateLines(ed);
    ed.addEventListener('input', function () {
      localStorage.setItem('arena-code-' + p.id, ed.value);
      updateLines(ed);
    });
    ed.addEventListener('scroll', function () { $('editor-lines').scrollTop = ed.scrollTop; });
    ed.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = ed.selectionStart, epos = ed.selectionEnd;
        ed.value = ed.value.slice(0, s) + '    ' + ed.value.slice(epos);
        ed.selectionStart = ed.selectionEnd = s + 4;
        ed.dispatchEvent(new Event('input'));
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); ARENA.run(false); }
    });

    $('stmt-body').parentElement.querySelectorAll('[data-tab]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.stmtTab = b.getAttribute('data-tab');
        $('stmt-body').innerHTML = stmtBody(p);
        $('stmt-body').parentElement.querySelectorAll('[data-tab]').forEach(function (x) {
          x.classList.toggle('active', x.getAttribute('data-tab') === state.stmtTab);
        });
        var rb = $('reveal-btn');
        if (rb) rb.addEventListener('click', function () {
          $('sol-wrap').classList.remove('locked');
          rb.remove();
        });
      });
    });
    var rb = $('reveal-btn');
    if (rb) rb.addEventListener('click', function () {
      $('sol-wrap').classList.remove('locked');
      rb.remove();
    });

    $('btn-reset').addEventListener('click', function () {
      ed.value = p.starter;
      localStorage.setItem('arena-code-' + p.id, ed.value);
      updateLines(ed);
    });
    $('btn-run-sample').addEventListener('click', function () { ARENA.run(false); });
    $('btn-run-all').addEventListener('click', function () { ARENA.run(true); });

    ARENA._current = p;
    Judge.ensureWorker();
  }

  // ---------- public API ----------
  window.ARENA = {
    go: function (v) { if (v === 'home') renderHome(); },
    open: function (id) { state.problemId = id; state.stmtTab = 'problem'; renderProblem(); },
    run: function (all) { if (window.Judge && ARENA._current) Judge.run(ARENA._current, all); },
    resetCode: function () { var b = $('btn-reset'); if (b) b.click(); },
    stmtTab: function (t) {
      var b = document.querySelector('[data-tab="' + t + '"]');
      if (b) b.click();
    },
    filterDiff: function (d) { state.filterDiff = d; renderFilters(); renderTable(); },
    filterTopic: function (t) { state.filterTopic = t; renderFilters(); renderTable(); },
    markSolved: function (id) { state.solved[id] = true; saveSolved(); },
    toast: toast,
    esc: esc,
    normOut: function (s) {
      var lines = String(s == null ? '' : s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+$/, ''); });
      while (lines.length && lines[lines.length - 1] === '') lines.pop();
      return lines.join('\n');
    },
    _state: state,
    _refreshSidebar: renderSidebar
  };

  // ---------- boot ----------
  function boot() {
    document.body.classList.add('coding-shell');
    applyTheme();
    $('theme-toggle').addEventListener('click', function () {
      state.dark = !state.dark;
      localStorage.setItem('arena-dark', state.dark ? '1' : '0');
      applyTheme();
    });
    $('hamburger').addEventListener('click', function () {
      $('sidebar').classList.add('open');
      $('sidebar-overlay').classList.add('active');
    });
    $('menu-toggle').addEventListener('click', function () {
      $('sidebar').classList.add('open');
      $('sidebar-overlay').classList.add('active');
    });
    $('sidebar-close').addEventListener('click', closeSidebar);
    $('sidebar-overlay').addEventListener('click', closeSidebar);

    fetch('/data/coding-problems.json?cb=' + Date.now())
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        PROBLEMS = data;
        window.ARENA_PROBLEMS = PROBLEMS;
        var hash = location.hash.match(/^#\/problem\/([\w-]+)/);
        if (hash && PROBLEMS.some(function (p) { return p.id === hash[1]; })) {
          ARENA.open(hash[1]);
        } else {
          renderHome();
        }
      })
      .catch(function (e) {
        setContent('<div class="empty-state">Failed to load problems: ' + esc(e.message) + '</div>');
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
