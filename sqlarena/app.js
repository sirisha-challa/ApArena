/* SQLArena — AXIS 2026 SQL track: problems + learn path + in-browser SQLite IDE */
(function () {
  'use strict';

  var PROBLEMS = [];
  var CURRICULUM = null;
  var state = {
    view: 'home',
    problemId: null,
    stmtTab: 'problem',
    filterDiff: 'all',
    filterLevel: 'all',
    solved: JSON.parse(localStorage.getItem('sqlarena-solved') || '{}'),
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
  function saveSolved() { localStorage.setItem('sqlarena-solved', JSON.stringify(state.solved)); updateSidebarProgress(); }
  function byId(id) { return PROBLEMS.find(function (p) { return p.id === id; }); }

  function applyTheme() {
    document.documentElement.classList.toggle('dark', state.dark);
    var b = $('theme-toggle');
    if (b) b.innerHTML = state.dark
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9.36 9.36 0 1 1 11.21 3 7.36 7.36 0 0 0 21 12.79z"/></svg>';
  }

  function levelOf(p) { return (p.level || '').split(' ')[0] || 'L?'; }

  function renderSidebar() {
    var groups = {};
    PROBLEMS.forEach(function (p) {
      var l = levelOf(p);
      (groups[l] = groups[l] || []).push(p);
    });
    var order = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
    var html = '<div class="sidebar-section-label">SQL Arena</div>' +
      '<button class="sidebar-item' + (state.view === 'home' ? ' active' : '') + '" data-go="home">' +
      '<span class="sidebar-item-icon">&#8962;</span><span class="sidebar-item-text">Problems</span></button>' +
      '<button class="sidebar-item' + (state.view === 'learn' ? ' active' : '') + '" data-go="learn">' +
      '<span class="sidebar-item-icon">&#9776;</span><span class="sidebar-item-text">Learn path (Basics&rarr;Mastery)</span></button>';
    order.forEach(function (l) {
      var list = groups[l] || [];
      if (!list.length) return;
      var done = list.filter(function (p) { return state.solved[p.id]; }).length;
      html += '<div class="sidebar-section-label">' + esc(l) + ' · ' + done + '/' + list.length + '</div>';
      list.forEach(function (p, i) {
        html += '<button class="sidebar-item' + (state.problemId === p.id ? ' active' : '') + '" data-open="' + p.id + '">' +
          '<span class="sidebar-item-icon" style="font-size:10px">' + (i + 1) + '</span>' +
          '<span class="sidebar-item-text">' + esc(p.title) + '</span>' +
          (state.solved[p.id] ? '<span class="solved-dot"></span>' : '') + '</button>';
      });
    });
    $('sidebar-nav').innerHTML = html;
    $('sidebar-nav').querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { ARENA.go(b.getAttribute('data-go')); closeSidebar(); });
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

  // ---------- home ----------
  function renderHome() {
    state.view = 'home'; state.problemId = null;
    $('header-title').textContent = 'SQL Arena';
    var back = $('back-button'); if (back) back.hidden = true;
    renderSidebar();
    var solvedCount = PROBLEMS.filter(function (p) { return state.solved[p.id]; }).length;
    var html =
      '<div class="arena-home">' +
        '<div class="arena-head"><h1>SQL Problems — AXIS 2026 pattern</h1>' +
        '<span class="progress-pill">' + solvedCount + ' / ' + PROBLEMS.length + ' solved</span></div>' +
        '<div class="sql-exam-note"><b>AXIS 2026 coding slot:</b> 3 Qs in 60 min — DSA + <b>SQL JOINs on 2–3 tables</b> + UI. Clear = 2 complete + 1 partial. ' +
        'Start at <b>L1</b> and work to <b>L7 mocks</b>. <button class="linklike" id="go-learn">Open the learn path &rarr;</button></div>' +
        '<div class="arena-filters" id="arena-filters"></div>' +
        '<div class="problem-table" id="problem-table"></div>' +
      '</div>';
    setContent(html);
    var gl = $('go-learn');
    if (gl) gl.addEventListener('click', function () { ARENA.go('learn'); });
    renderFilters();
    renderTable();
  }

  function renderFilters() {
    var diffs = ['all', 'easy', 'medium', 'hard'];
    var levels = ['all', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];
    var html = diffs.map(function (d) {
      return '<button class="' + (state.filterDiff === d ? 'active' : '') + '" data-fdiff="' + d + '">' + (d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1)) + '</button>';
    }).join('') + '<span class="sep"></span>' +
      levels.map(function (l) {
        return '<button class="' + (state.filterLevel === l ? 'active' : '') + '" data-flevel="' + l + '">' + (l === 'all' ? 'All levels' : l) + '</button>';
      }).join('');
    $('arena-filters').innerHTML = html;
    $('arena-filters').querySelectorAll('[data-fdiff]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterDiff = b.getAttribute('data-fdiff'); renderFilters(); renderTable(); });
    });
    $('arena-filters').querySelectorAll('[data-flevel]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterLevel = b.getAttribute('data-flevel'); renderFilters(); renderTable(); });
    });
  }

  function renderTable() {
    var list = PROBLEMS.filter(function (p) {
      return (state.filterDiff === 'all' || p.difficulty === state.filterDiff) &&
             (state.filterLevel === 'all' || levelOf(p) === state.filterLevel);
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
        '<div class="pr-topic">' + esc(levelOf(p)) + ' · ' + esc(p.topic) + '</div>' +
        '<div class="pr-approach">' + esc(p.pattern || '') + '</div>' +
        '<div><span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span></div>' +
        '<div class="pr-arrow">›</div></div>';
    }).join('');
    wrap.querySelectorAll('[data-open]').forEach(function (row) {
      row.addEventListener('click', function () { ARENA.open(row.getAttribute('data-open')); });
    });
  }

  // ---------- learn path ----------
  function renderLearn() {
    state.view = 'learn'; state.problemId = null;
    $('header-title').textContent = 'SQL Learn Path';
    var back = $('back-button'); if (back) back.hidden = true;
    renderSidebar();
    if (!CURRICULUM) {
      setContent('<div class="empty-state">Curriculum failed to load.</div>');
      return;
    }
    var html = '<div class="arena-home"><div class="arena-head"><h1>Basics &rarr; Mastery</h1>' +
      '<span class="progress-pill">' + PROBLEMS.filter(function (p) { return state.solved[p.id]; }).length + ' / ' + PROBLEMS.length + ' solved</span></div>' +
      '<div class="sql-exam-note">' + esc(CURRICULUM.examNote) + '</div>' +
      CURRICULUM.levels.map(function (lv) {
        var plist = lv.problemIds.map(byId).filter(Boolean);
        var done = plist.filter(function (p) { return state.solved[p.id]; }).length;
        return '<div class="learn-level"><div class="learn-level-head"><div><h2>' + esc(lv.title) + '</h2>' +
          '<p>' + esc(lv.goal) + '</p></div>' +
          '<span class="progress-pill">' + done + '/' + plist.length + '</span></div>' +
          '<div class="learn-skills">' + lv.skills.map(function (s) { return '<span class="skill-chip">' + esc(s) + '</span>'; }).join('') + '</div>' +
          '<div class="learn-problems">' + plist.map(function (p) {
            var s = !!state.solved[p.id];
            return '<button class="learn-problem' + (s ? ' solved' : '') + '" data-open="' + p.id + '">' +
              '<span class="lp-tick">' + (s ? '✓' : '○') + '</span><span>' + esc(p.title) + '</span>' +
              '<span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span></button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>';
    setContent(html);
    document.querySelectorAll('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { ARENA.open(b.getAttribute('data-open')); });
    });
  }

  // ---------- problem view ----------
  function schemaTab(p) {
    var h = '<div class="stmt-title">' + esc(p.title) + ' — Schema</div>' +
      '<span class="stmt-label">Tables (visible dataset preview, first 5 rows)</span>';
    h += p.tables.map(function (t) {
      return '<div class="schema-table"><div class="sc-head">' + esc(t.name) +
        ' <span style="font-weight:400">(' + t.totalRows + ' rows)</span></div>' +
        '<div class="sql-table-wrap"><table class="sql-table"><thead><tr>' +
        t.columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
        '</tr></thead><tbody>' +
        t.sampleRows.map(function (r) {
          return '<tr>' + r.map(function (v) {
            return (v === '' || v === null) ? '<td class="sql-null">NULL</td>' : '<td>' + esc(v) + '</td>';
          }).join('') + '</tr>';
        }).join('') + '</tbody></table></div></div>';
    }).join('');
    h += '<span class="stmt-label">Full DDL + seed (visible dataset)</span>' +
      '<pre class="pseudocode-pre sql-ddl">' + esc(p.schemaSQL + '\n' + p.seedSQL) + '</pre>' +
      '<div class="complexity-box">Hidden test uses the same schema with different rows — never hardcode values.</div>';
    return h;
  }

  function stmtBody(p) {
    if (state.stmtTab === 'schema') return schemaTab(p);
    if (state.stmtTab === 'steps') {
      return '<div class="approach-box"><b>Approach — </b>' + esc(p.approach) + '</div>' +
        '<span class="stmt-label">Step-by-step</span><div class="steps-list">' +
        p.steps.map(function (s) { return '<div class="step">' + esc(s) + '</div>'; }).join('') + '</div>' +
        (p.learn ? '<div class="insight-box"><b>Concept — </b>' + esc(p.learn) + '</div>' : '') +
        '<div class="insight-box"><b>Pattern insight — </b>' + esc(p.insight) + '</div>';
    }
    if (state.stmtTab === 'solution') {
      var solved = state.solved[p.id];
      return '<div class="solution-reveal' + (solved ? '' : ' locked') + '" id="sol-wrap">' +
        '<span class="stmt-label">Reference solution</span>' +
        '<pre class="pseudocode-pre" style="border:1px solid var(--border);border-radius:10px">' + esc(p.solution) + '</pre>' +
        (solved ? '' : '<button class="reveal-btn" id="reveal-btn"><span>Reveal — click to unlock</span></button>') + '</div>' +
        '<div class="insight-box"><b>Pattern insight — </b>' + esc(p.insight) + '</div>';
    }
    var t0 = p.tests[0];
    var expPreview = t0.expectedColumns.join(' | ') + '\n' +
      t0.expectedRows.map(function (r) { return r.join(' | '); }).join('\n');
    return '<div class="stmt-title">' + esc(p.title) + '</div>' +
      '<div class="stmt-meta"><span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span>' +
      '<span class="ib-meta">' + esc(p.level || '') + ' · ' + esc(p.topic) + ' · ' + esc(p.pattern || '') + '</span></div>' +
      (p.years ? '<div class="pyq-tag">Asked: ' + esc(p.years) + '</div>' : '') +
      '<div class="stmt-block">' + p.statement + '</div>' +
      '<span class="stmt-label">Expected columns' + (p.ordered ? ' (order matters)' : ' (row order free)') + (p.dml ? ' · DML: your statement mutates the table' : '') + '</span>' +
      '<div class="stmt-constraints">' + esc(t0.expectedColumns.join(', ')) + '</div>' +
      '<span class="stmt-label">Sample — expected output (visible dataset)</span>' +
      '<div class="sample-case"><div class="sc-head">Expected rows</div><pre class="sc-out">' + esc(expPreview || '(0 rows)') + '</pre></div>' +
      '<div class="complexity-box">Open the <b>Schema</b> tab for tables. Submit runs a second <b>hidden dataset</b> with different rows.</div>';
  }

  function updateLines(ed) {
    var n = ed.value.split('\n').length;
    var out = '';
    for (var i = 1; i <= n; i++) out += i + '\n';
    $('editor-lines').textContent = out;
    $('editor-lines').scrollTop = ed.scrollTop;
  }

  function renderProblem() {
    var p = byId(state.problemId);
    if (!p) { ARENA.go('home'); return; }
    state.view = 'problem';
    $('header-title').textContent = p.title;
    var back = $('back-button'); if (back) back.hidden = false;
    renderSidebar();

    var html =
      '<div class="ide-wrap"><div class="ide-bar"><div class="ib-title">' + esc(p.title) + '</div>' +
      '<span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span>' +
      '<span class="ib-meta">' + esc(p.level || '') + ' &middot; ' + (p.dml ? 'DML' : 'SELECT') + ' &middot; 2 datasets</span>' +
      '<div class="ib-spacer"></div><span class="ib-meta">SQLite &middot; in-browser</span></div>' +
      '<div class="ide"><div class="ide-pane"><div class="ide-pane-head"><span class="pane-label">Problem</span>' +
      '<div class="stmt-tabs">' +
      '<button class="' + (state.stmtTab === 'problem' ? 'active' : '') + '" data-tab="problem">Task</button>' +
      '<button class="' + (state.stmtTab === 'schema' ? 'active' : '') + '" data-tab="schema">Schema</button>' +
      '<button class="' + (state.stmtTab === 'steps' ? 'active' : '') + '" data-tab="steps">Approach</button>' +
      '<button class="' + (state.stmtTab === 'solution' ? 'active' : '') + '" data-tab="solution">Solution</button>' +
      '</div></div><div class="ide-pane-body" id="stmt-body">' + stmtBody(p) + '</div></div>' +
      '<div class="ide-pane"><div class="ide-pane-head"><span class="pane-label">SQL</span>' +
      '<button class="btn-run secondary" id="btn-reset" style="margin-left:auto;padding:5px 12px;font-size:11.5px">Reset</button></div>' +
      '<div class="editor-wrap"><div class="editor-lines" id="editor-lines">1</div>' +
      '<textarea id="editor" spellcheck="false" autocomplete="off"></textarea></div>' +
      '<div class="editor-statusbar"><button class="btn-run" id="btn-run-sample"><span>&#9654; Run sample</span></button>' +
      '<button class="btn-run" id="btn-run-all"><span>&#10003; Submit</span></button>' +
      '<span class="py-status" id="sql-status">engine: not loaded</span>' +
      '<span class="hint" style="margin-left:auto">Ctrl+Enter = run</span></div></div>' +
      '<div class="ide-pane"><div class="ide-pane-head"><span class="pane-label">Results</span>' +
      '<span class="ib-meta" style="margin-left:auto">sample + hidden</span></div>' +
      '<div class="ide-pane-body" id="judge-body"><div class="judge-summary idle" id="judge-summary">Run your query to see results.</div>' +
      '<div id="judge-list"></div></div></div></div></div>';

    setContent(html);

    var ed = $('editor');
    ed.value = localStorage.getItem('sqlarena-code-' + p.id) || p.starter;
    updateLines(ed);
    ed.addEventListener('input', function () {
      localStorage.setItem('sqlarena-code-' + p.id, ed.value);
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

    function bindTabs() {
      var bar = document.querySelector('#app-content [data-tab]');
      if (!bar) return;
      document.querySelectorAll('#app-content [data-tab]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.stmtTab = b.getAttribute('data-tab');
          $('stmt-body').innerHTML = stmtBody(p);
          document.querySelectorAll('#app-content [data-tab]').forEach(function (x) {
            x.classList.toggle('active', x.getAttribute('data-tab') === state.stmtTab);
          });
          var rb = $('reveal-btn');
          if (rb) rb.addEventListener('click', function () { $('sol-wrap').classList.remove('locked'); rb.remove(); });
        });
      });
    }
    bindTabs();
    var rb = $('reveal-btn');
    if (rb) rb.addEventListener('click', function () { $('sol-wrap').classList.remove('locked'); rb.remove(); });

    $('btn-reset').addEventListener('click', function () {
      ed.value = p.starter;
      localStorage.setItem('sqlarena-code-' + p.id, ed.value);
      updateLines(ed);
    });
    $('btn-run-sample').addEventListener('click', function () { ARENA.run(false); });
    $('btn-run-all').addEventListener('click', function () { ARENA.run(true); });

    ARENA._current = p;
    if (window.SQLJudge) SQLJudge.ensureLoaded();
  }

  window.ARENA = {
    go: function (v) { if (v === 'home') renderHome(); else if (v === 'learn') renderLearn(); },
    open: function (id) { state.problemId = id; state.stmtTab = 'problem'; renderProblem(); },
    run: function (all) { if (window.SQLJudge && ARENA._current) SQLJudge.run(ARENA._current, all); },
    markSolved: function (id) { state.solved[id] = true; saveSolved(); },
    toast: toast,
    esc: esc,
    _state: state,
    _refreshSidebar: renderSidebar
  };

  function boot() {
    document.body.classList.add('coding-shell');
    applyTheme();
    var tt = $('theme-toggle');
    if (tt) tt.addEventListener('click', function () {
      state.dark = !state.dark;
      localStorage.setItem('arena-dark', state.dark ? '1' : '0');
      applyTheme();
    });
    $('hamburger').addEventListener('click', function () {
      $('sidebar').classList.add('open');
      $('sidebar-overlay').classList.add('active');
    });
    var mt = $('menu-toggle');
    if (mt) mt.addEventListener('click', function () {
      $('sidebar').classList.add('open');
      $('sidebar-overlay').classList.add('active');
    });
    $('sidebar-close').addEventListener('click', closeSidebar);
    $('sidebar-overlay').addEventListener('click', closeSidebar);
    var back = $('back-button');
    if (back) back.addEventListener('click', function () { ARENA.go(state.view === 'problem' ? 'home' : 'home'); });

    Promise.all([
      fetch('/data/sql-problems.json?cb=' + Date.now()).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }),
      fetch('/data/sql-curriculum.json?cb=' + Date.now()).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }).catch(function () { return null; })
    ]).then(function (res) {
      PROBLEMS = res[0];
      CURRICULUM = res[1];
      window.SQLARENA_PROBLEMS = PROBLEMS;
      var hash = location.hash.match(/^#\/problem\/([\w-]+)/);
      if (hash && PROBLEMS.some(function (p) { return p.id === hash[1]; })) ARENA.open(hash[1]);
      else if ((location.hash || '') === '#/learn') renderLearn();
      else renderHome();
    }).catch(function (e) {
      setContent('<div class="empty-state">Failed to load SQL problems: ' + esc(e.message) + '</div>');
    });
    window.addEventListener('hashchange', function () {
      if (!PROBLEMS.length) return;
      var h = location.hash.match(/^#\/problem\/([\w-]+)/);
      if (h && byId(h[1])) { state.problemId = h[1]; state.stmtTab = 'problem'; renderProblem(); }
      else if (location.hash === '#/learn') renderLearn();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
