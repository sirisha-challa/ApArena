/* ApArena Coding Arena — views, sidebar, landing, editor */
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
      '<span class="sidebar-item-icon">&#8962;</span><span class="sidebar-item-text">Overview &amp; Patterns</span></button>' +
      '<div class="sidebar-section-label">Problems</div>';
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
    if (txt) txt.textContent = done + ' / ' + PROBLEMS.length + ' solved';
  }
  function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('sidebar-overlay').classList.remove('active');
  }

  function evo(era, title, text, tags) {
    return '<div class="evo-item"><div class="evo-era">' + era + '</div><h3>' + esc(title) + '</h3><p>' + esc(text) + '</p>' +
      '<div class="evo-tags">' + tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div></div>';
  }

  function renderHome() {
    state.view = 'home'; state.problemId = null;
    $('header-title').textContent = 'Coding Arena';
    $('back-button').hidden = true;
    renderSidebar();

    var byTopic = {};
    PROBLEMS.forEach(function (p) { byTopic[p.topic] = (byTopic[p.topic] || 0) + 1; });
    var topics = Object.keys(byTopic).sort(function (a, b) { return byTopic[b] - byTopic[a]; });
    var maxF = Math.max.apply(null, topics.map(function (t) { return byTopic[t]; }));
    var solvedCount = PROBLEMS.filter(function (p) { return state.solved[p.id]; }).length;

    var html =
    '<section class="arena-hero">' +
      '<p class="eyebrow">ApArena &middot; Accenture Campus Coding Test</p>' +
      '<h1><span>The Coding Arena.</span><br><em>Real patterns. Real judge.</em></h1>' +
      '<p class="sub">Every problem is drawn from the published Accenture coding-question pool (2010-2025) and handcrafted with beginner-level, step-by-step walkthroughs. Write Python in the browser — a real CPython runtime (Pyodide/WebAssembly) executes it against the judge&rsquo;s test cases, exactly like the exam&rsquo;s code + output panes.</p>' +
      '<div class="arena-stats">' +
        '<div class="arena-stat"><b>3 / 60</b><span>questions / minutes (AXIS)</span></div>' +
        '<div class="arena-stat"><b>2 + 1</b><span>complete + partial to clear</span></div>' +
        '<div class="arena-stat"><b>' + PROBLEMS.length + '</b><span>handcrafted problems</span></div>' +
        '<div class="arena-stat"><b>' + solvedCount + '</b><span>solved by you</span></div>' +
      '</div>' +
    '</section>' +

    '<section class="arena-section">' +
      '<h2>Pattern evolution, 2010 &rarr; 2026</h2>' +
      '<p class="section-sub">Synthesised from PrepInsta, TalentBattle, GeeksforGeeks interview reports, naukri/Code360 sets and Reddit candidate reports.</p>' +
      '<div class="evo-timeline">' +
        evo('2010-2016', 'Written test era', 'Off-campus written rounds: C/C++ output-prediction MCQs plus 1-2 short programs on paper or a bare terminal. Focus: loops, number programs, basic strings. No standard online judge — evaluators read the code.',
            ['C / C++', 'paper rounds', 'loops & math']) +
        evo('2017-2019', 'Online AMCAT-style rounds', 'Online judges arrive: 2 coding questions in 60 minutes, stdin/stdout format, languages C/C++/Java/Python. Questions come from a stable pool: primes, Fibonacci, palindromes, digit programs.',
            ['2 Q / 60 min', 'stdin/stdout', 'known pool']) +
        evo('2020-2023', 'The famous repeat pool', 'Same 2-question structure (45-60 min) but the pool stabilises and repeats heavily: Caesar cipher, autobiographical numbers, move-hyphens-to-front, second largest, rat-count-house, password validator, find-the-key. Candidates who mastered the pool cleared routinely.',
            ['heavy repeats', 'strings + arrays + math', '1 complete + 1 partial']) +
        evo('2024-2026', 'AXIS pattern (current)', 'Three questions in 60 minutes: (1) an easy-to-medium DSA problem — mostly arrays (the leader-element question of Nov 2024 is a verified example), (2) a SQL query task, (3) an HTML/CSS UI modification task. Languages expand to JavaScript. Clearing needs 2 complete outputs + 1 partial. Non-adaptive, no negative marking.',
            ['3 Q / 60 min', 'DSA + SQL + Web UI', '2 complete + 1 partial']) +
      '</div>' +
    '</section>' +

    '<section class="arena-section">' +
      '<h2>What the pool actually tests</h2>' +
      '<p class="section-sub">Frequency across the ' + PROBLEMS.length + ' handcrafted problems, weighted by how often each pattern appears in published sets.</p>' +
      '<div class="freq-grid">' +
        topics.map(function (t) {
          var c = byTopic[t];
          return '<div class="freq-row"><div class="freq-top"><span>' + esc(t) + '</span><span>' + c + ' problem' + (c > 1 ? 's' : '') + '</span></div>' +
            '<div class="freq-bar"><div style="width:' + Math.round(c / maxF * 100) + '%"></div></div></div>';
        }).join('') +
      '</div>' +
      '<div class="revision-card tricks-card" style="margin-top:14px"><span class="callout-label">Pattern insights</span><ul>' +
        '<li><b>Arrays + strings &asymp; 70%</b> of the DSA ask — loops, scans and sorts; no DP or graphs in the campus round.</li>' +
        '<li><b>Math/number programs</b> (primes, digit sums, base conversion, series) are the reliable second question.</li>' +
        '<li>Everything is <b>stdin/stdout</b> — read with input(), print exactly what is asked, nothing extra.</li>' +
        '<li>The AXIS third slot is <b>SQL + HTML/CSS</b> — practice those in the Programming and Core banks.</li>' +
        '<li>The clearing bar is modest: <b>2 complete + 1 partial</b>. Accuracy beats cleverness.</li>' +
      '</ul></div>' +
    '</section>' +

    '<section class="arena-section">' +
      '<h2>The problem set</h2>' +
      '<p class="section-sub">Handcrafted statements in exam format. Each has a beginner walkthrough, reference solution and judge tests.</p>' +
      '<div class="arena-filters" id="arena-filters"></div>' +
      '<div class="problem-grid" id="problem-grid"></div>' +
    '</section>';

    setContent(html);
    renderFilters();
    renderGrid();
  }

  function renderFilters() {
    var diffs = ['all', 'easy', 'medium', 'hard'];
    var topicSet = {};
    PROBLEMS.forEach(function (p) { topicSet[p.topic] = 1; });
    var topics = ['all'].concat(Object.keys(topicSet).sort());
    var html = diffs.map(function (d) {
      return '<button class="' + (state.filterDiff === d ? 'active' : '') + '" data-fdiff="' + d + '">' + (d === 'all' ? 'All levels' : d[0].toUpperCase() + d.slice(1)) + '</button>';
    }).join('');
    html += topics.map(function (t) {
      return '<button class="' + (state.filterTopic === t ? 'active' : '') + '" data-ftopic="' + esc(t) + '">' + (t === 'all' ? 'All topics' : esc(t)) + '</button>';
    }).join('');
    $('arena-filters').innerHTML = html;
    $('arena-filters').querySelectorAll('[data-fdiff]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterDiff = b.getAttribute('data-fdiff'); renderFilters(); renderGrid(); });
    });
    $('arena-filters').querySelectorAll('[data-ftopic]').forEach(function (b) {
      b.addEventListener('click', function () { state.filterTopic = b.getAttribute('data-ftopic'); renderFilters(); renderGrid(); });
    });
  }

  function renderGrid() {
    var grid = $('problem-grid');
    var list = PROBLEMS.filter(function (p) {
      return (state.filterDiff === 'all' || p.difficulty === state.filterDiff) &&
             (state.filterTopic === 'all' || p.topic === state.filterTopic);
    });
    grid.innerHTML = list.length ? list.map(function (p) {
      var idx = PROBLEMS.indexOf(p) + 1;
      return '<div class="problem-card' + (state.solved[p.id] ? ' solved' : '') + '" data-open="' + p.id + '">' +
        (state.solved[p.id] ? '<span class="pc-solved">&#10003; solved</span>' : '') +
        '<div class="pc-top"><span class="pc-num">' + String(idx).padStart(2, '0') + '</span>' +
        '<span class="diff-chip ' + p.difficulty + '">' + p.difficulty + '</span>' +
        '<span class="topic-chip">' + esc(p.topic) + '</span></div>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<div class="pc-pattern">' + esc(p.approach) + '</div>' +
        '<div class="pc-years">' + esc(p.years) + '</div>' +
        '</div>';
    }).join('') : '<div class="empty-state">No problems match the filter.</div>';
    grid.querySelectorAll('[data-open]').forEach(function (card) {
      card.addEventListener('click', function () { ARENA.open(card.getAttribute('data-open')); });
    });
  }

  // ---------- problem view ----------
  function stmtBody(p) {
    if (state.stmtTab === 'steps') {
      return '<div class="approach-box"><b>Approach — </b>' + esc(p.approach) + '</div>' +
        '<span class="stmt-label">Step-by-step (beginner level)</span>' +
        '<div class="steps-list">' + p.steps.map(function (s) { return '<div class="step">' + esc(s) + '</div>'; }).join('') + '</div>' +
        '<div class="complexity-box">Complexity: ' + esc(p.complexity) + '</div>';
    }
    if (state.stmtTab === 'solution') {
      var solved = state.solved[p.id];
      return '<div class="solution-reveal' + (solved ? '' : ' locked') + '" id="sol-wrap">' +
        '<span class="stmt-label">Reference solution (Python 3)</span>' +
        '<pre class="pseudocode-pre" style="border:1px solid var(--border);border-radius:10px">' + esc(p.solution) + '</pre>' +
        (solved ? '' : '<button class="reveal-btn" id="reveal-btn"><span>Reveal after attempting &mdash; click to unlock</span></button>') +
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
    '<div class="ide">' +
      '<div class="ide-pane">' +
        '<div class="ide-pane-head"><span class="pane-label">Problem</span>' +
          '<div class="stmt-tabs">' +
            '<button class="' + (state.stmtTab === 'problem' ? 'active' : '') + '" data-tab="problem">Problem</button>' +
            '<button class="' + (state.stmtTab === 'steps' ? 'active' : '') + '" data-tab="steps">How to solve</button>' +
            '<button class="' + (state.stmtTab === 'solution' ? 'active' : '') + '" data-tab="solution">Solution</button>' +
          '</div>' +
        '</div>' +
        '<div class="ide-pane-body" id="stmt-body">' + stmtBody(p) + '</div>' +
      '</div>' +
      '<div class="ide-pane">' +
        '<div class="ide-pane-head"><span class="pane-label">Editor</span>' +
          '<span class="lang-chip">Python 3 &middot; in-browser</span>' +
          '<button class="btn-run secondary" id="btn-reset" style="margin-left:auto;padding:6px 14px;font-size:11.5px">Reset</button>' +
        '</div>' +
        '<div class="editor-wrap">' +
          '<div class="editor-lines" id="editor-lines">1</div>' +
          '<textarea id="editor" spellcheck="false" autocomplete="off"></textarea>' +
        '</div>' +
        '<div class="editor-statusbar">' +
          '<button class="btn-run" id="btn-run-sample"><span>&#9654; Run sample</span></button>' +
          '<button class="btn-run" id="btn-run-all"><span>&#10003; Submit all tests</span></button>' +
          '<span class="py-status" id="py-status">runtime: not loaded</span>' +
          '<span class="hint" style="margin-left:auto">Ctrl+Enter = run sample</span>' +
        '</div>' +
      '</div>' +
      '<div class="ide-pane">' +
        '<div class="ide-pane-head"><span class="pane-label">Test cases</span>' +
          '<span class="py-status" style="margin-left:auto">' + p.tests.length + ' tests &middot; first ' + p.samples.length + ' visible</span>' +
        '</div>' +
        '<div class="ide-pane-body" id="judge-body">' +
          '<div class="judge-summary idle" id="judge-summary">Run your code to see results here.</div>' +
          '<div id="judge-list"></div>' +
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
    filterDiff: function (d) { state.filterDiff = d; renderFilters(); renderGrid(); },
    filterTopic: function (t) { state.filterTopic = t; renderFilters(); renderGrid(); },
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
