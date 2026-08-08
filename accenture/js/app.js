/* ArenaApp — dashboard / section / topic views for the Accenture preparation page.
 * Hash router: #/ , #/section/:id , #/topic/:sectionId/:topicId */
(function () {
  'use strict';

  var R = window.ArenaRenderer;
  var state = { syllabus: null, section: null, topic: null, viewed: {} };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var ICONS = {
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h3a2 2 0 0 0 2-2V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1z"/><path d="M4 21h3a2 2 0 0 0 2-2v-2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1z"/><path d="M17 4h3a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2h-2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M21 17h-3a2 2 0 0 0-2 2v2a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1z"/><path d="M12 4v16"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44A2.5 2.5 0 0 1 4 17.5a2.5 2.5 0 0 1-2-4.09 2.5 2.5 0 0 1 2-6.41A2.5 2.5 0 0 1 6.5 2h3z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44A2.5 2.5 0 0 0 20 17.5a2.5 2.5 0 0 0 2-4.09 2.5 2.5 0 0 0-2-6.41A2.5 2.5 0 0 0 17.5 2h-3z"/></svg>',
    shape: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><rect x="13" y="3" width="8" height="6" rx="1.5"/><path d="M4 14l4 6h8l4-6z"/></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/></svg>',
    office: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h.01M12 10h.01M15 10h.01M9 14h.01M12 14h.01M15 14h.01"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a4.5 4.5 0 1 0-.4-9A7 7 0 1 0 4 14.5 4.5 4.5 0 0 0 5 19h12.5z"/></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 17 6-5-6-5"/><path d="M12 19h8"/></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0 0 14 0M12 17v5"/></svg>'
  };

  var STATUS_META = {
    pending: { label: 'Content pending', cls: 'pending' },
    sample: { label: 'Sample', cls: 'sample' },
    'in-progress': { label: 'In progress', cls: 'in-progress' },
    complete: { label: 'Complete', cls: 'complete' }
  };

  /* ---------- persistence ---------- */

  function loadViewed() {
    try { state.viewed = JSON.parse(localStorage.getItem('accentureViewed')) || {}; } catch (e) { state.viewed = {}; }
  }
  function saveViewed() {
    try { localStorage.setItem('accentureViewed', JSON.stringify(state.viewed)); } catch (e) {}
  }
  function topicKey(sid, tid) { return sid + '/' + tid; }
  function isViewed(sid, tid) { return !!state.viewed[topicKey(sid, tid)]; }
  function markViewed(sid, tid, v) {
    if (v) state.viewed[topicKey(sid, tid)] = 1; else delete state.viewed[topicKey(sid, tid)];
    saveViewed();
  }

  function loadTheme() {
    var t = localStorage.getItem('accentureTheme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    applyTheme(t);
  }
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('accentureTheme', t);
    var btn = $('[data-action="theme"]');
    if (btn) btn.innerHTML = t === 'dark' ? sunIco() : moonIco();
  }
  function sunIco() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'; }
  function moonIco() { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'; }

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function badge(status) {
    var m = STATUS_META[status] || STATUS_META.pending;
    return '<span class="badge b-' + m.cls + '">' + m.label + '</span>';
  }
  function countStatus(section, status) {
    return section.topics.filter(function (t) { return t.status === status; }).length;
  }

  /* ---------- views ---------- */

  function viewDashboard() {
    var s = state.syllabus;
    var allTopics = s.sections.reduce(function (a, x) { return a.concat(x.topics); }, []);
    var ready = allTopics.filter(function (t) { return t.status !== 'pending' && t.status !== 'outline'; }).length;
    var viewed = Object.keys(state.viewed).length;

    var html = '';
    html += '<section class="hero">';
    html += '<p class="eyebrow">ACCENTURE &middot; ASE / AASE &middot; ' + esc(s.meta.company) + '</p>';
    html += '<h1 class="hero-title">' + esc(s.meta.title) + '</h1>';
    html += '<p class="hero-sub">' + esc(s.meta.subtitle) + '</p>';
    html += '<div class="hero-chips">';
    html += '<span class="chip">Eligibility: ' + esc(s.meta.eligibility) + '</span>';
    html += '<span class="chip">CTC: ASE ' + esc(s.meta.ctc.ASE) + ' &middot; AASE ' + esc(s.meta.ctc.AASE) + '</span>';
    html += '<span class="chip">' + (s.meta.negativeMarking ? 'Negative marking' : 'No negative marking') + '</span>';
    html += '<span class="chip">All rounds eliminatory</span>';
    html += '</div>';
    html += '<div class="hero-cta">';
    html += '<a class="btn primary" href="#/section/pseudocode">Start with Pseudo Code</a>';
    html += '<a class="btn ghost" href="#syllabus-grid">Full syllabus</a>';
    html += '</div></section>';

    html += '<section class="stats-row">';
    html += statCard(s.sections.length, 'Sections', 'exam rounds + technical');
    html += statCard(allTopics.length, 'Topics', 'syllabus items');
    html += statCard(ready, 'Ready', 'content loaded so far');
    html += statCard(viewed, 'Reviewed', 'by you');
    html += statCard(5, 'Rounds', 'behavioral → coding → comm');
    html += '</section>';

    html += '<section class="pattern-card"><header><h2>Exam pattern <span class="muted">' + esc(s.examPattern.current.label) + '</span></h2><p>' +
      (s.examPattern.legacy.note ? 'Legacy CoCubes pattern: ' + esc(s.examPattern.legacy.note) : '') + '</p></header><div class="timeline">';
    s.examPattern.current.rounds.forEach(function (r, i) {
      html += '<div class="round-card"><span class="round-num">R' + (i + 1) + '</span><h3>' + esc(r.name) + '</h3>' +
        '<p class="round-meta">' + esc(r.questions) + ' questions' + (r.duration ? ' &middot; ' + esc(r.duration) : '') + '</p>' +
        (r.note ? '<p class="round-note">' + esc(r.note) + '</p>' : '') + '</div>';
    });
    html += '</div></section>';

    html += '<section class="syllabus" id="syllabus-grid">';
    html += '<header class="section-head"><div><h2>Syllabus sections</h2><p>Content is uploaded section by section — every topic renders with premium math, pseudocode and step-by-step explanations.</p></div>';
    html += '<div class="search-wrap"><input type="search" id="section-search" placeholder="Filter sections or topics…" aria-label="Filter syllabus"></div></header>';
    html += '<div class="section-grid">';
    s.sections.forEach(function (sec) {
      var done = sec.topics.filter(function (t) { return isViewed(sec.id, t.id); }).length;
      var pct = Math.round(done / sec.topics.length * 100);
      var chips = sec.topics.slice(0, 5).map(function (t) {
        return '<span class="topic-chip' + (isViewed(sec.id, t.id) ? ' seen' : '') + '">' + esc(t.title) + '</span>';
      }).join('');
      var more = sec.topics.length > 5 ? '<span class="topic-chip more">+' + (sec.topics.length - 5) + ' more</span>' : '';
      html += '<a class="section-card" href="#/section/' + esc(sec.id) + '" data-search="' + esc(sec.name + ' ' + sec.topics.map(function (t) { return t.title; }).join(' ')) + '">';
      html += '<div class="sc-top"><span class="sec-icon">' + (ICONS[sec.icon] || ICONS.book) + '</span><div class="sec-head"><span class="round-chip">' + esc(sec.round) + '</span><span class="q-chip">' + esc(sec.questions) + ' Q' + (sec.duration ? ' &middot; ' + esc(sec.duration) : '') + '</span></div></div>';
      html += '<h3 class="sec-name">' + esc(sec.name) + '</h3>';
      html += '<p class="sec-desc">' + esc(sec.description) + '</p>';
      html += '<div class="sec-topics">' + chips + more + '</div>';
      html += '<div class="sec-progress"><div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div><span class="progress-label">' + done + '/' + sec.topics.length + ' reviewed</span></div>';
      html += '</a>';
    });
    html += '</div></section>';

    $('#main').innerHTML = html;
    var search = $('#section-search');
    if (search) {
      search.addEventListener('input', function () {
        var q = this.value.toLowerCase().trim();
        $$('.section-card').forEach(function (card) {
          card.style.display = !q || (card.getAttribute('data-search') || '').toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }
  }

  function statCard(num, label, sub) {
    return '<div class="stat-card"><span class="stat-num">' + num + '</span><span class="stat-label">' + label + '</span><span class="stat-sub">' + sub + '</span></div>';
  }

  function viewSection(id) {
    var sec = state.syllabus.sections.filter(function (x) { return x.id === id; })[0];
    if (!sec) { location.hash = '#/'; return; }
    state.section = sec;

    var html = '';
    html += '<nav class="crumbs"><a href="#/">Dashboard</a><span class="sep">/</span><span>' + esc(sec.name) + '</span></nav>';
    html += '<section class="sec-hero">';
    html += '<div class="sec-hero-icon">' + (ICONS[sec.icon] || ICONS.book) + '</div>';
    html += '<div class="sec-hero-body"><h1>' + esc(sec.name) + '</h1>';
    html += '<div class="hero-chips"><span class="chip">' + esc(sec.round) + '</span><span class="chip">' + esc(sec.questions) + ' questions' + (sec.duration ? ' &middot; ' + esc(sec.duration) : '') + '</span><span class="chip">' + sec.topics.length + ' topics</span></div>';
    html += '<p class="sec-desc">' + esc(sec.description) + '</p></div></section>';

    html += '<div class="topic-list">';
    sec.topics.forEach(function (t) {
      var meta = STATUS_META[t.status] || STATUS_META.pending;
      var seen = isViewed(sec.id, t.id);
      html += '<div class="topic-item" data-topic="' + esc(t.id) + '">';
      html += '<button class="topic-row" data-action="open-topic" data-href="#/topic/' + esc(sec.id) + '/' + esc(t.id) + '" aria-expanded="false">';
      html += '<span class="topic-status-dot s-' + meta.cls + '" title="' + meta.label + '"></span>';
      html += '<span class="topic-title">' + esc(t.title) + (seen ? '<span class="seen-tag">reviewed</span>' : '') + '</span>';
      html += badge(t.status);
      html += '<span class="topic-chev" aria-hidden="true">&#9654;</span>';
      html += '</button>';
      if (!t.content) {
        html += '<div class="topic-empty"><div class="empty-art" aria-hidden="true">' + ICONS.book + '</div><p><strong>Content pending.</strong> This topic is queued for upload — the outline is final, the lesson is on its way.</p></div>';
      }
      html += '</div>';
    });
    html += '</div>';

    $('#main').innerHTML = html;

    $$('.topic-row', $('#main')).forEach(function (row) {
      row.addEventListener('click', function () {
        location.hash = row.getAttribute('data-href');
      });
    });
  }

  function viewTopic(sid, tid) {
    var sec = state.syllabus.sections.filter(function (x) { return x.id === sid; })[0];
    if (!sec) { location.hash = '#/'; return; }
    var t = sec.topics.filter(function (x) { return x.id === tid; })[0];
    if (!t) { location.hash = '#/section/' + sid; return; }
    state.section = sec;
    state.topic = t;

    var html = '';
    html += '<nav class="crumbs"><a href="#/">Dashboard</a><span class="sep">/</span><a href="#/section/' + esc(sid) + '">' + esc(sec.name) + '</a><span class="sep">/</span><span>' + esc(t.title) + '</span></nav>';

    if (!t.content) {
      html += '<section class="topic-empty-lg"><div class="empty-art">' + ICONS.book + '</div><h1>' + esc(t.title) + '</h1><p>This topic has not been uploaded yet. It will appear here with premium math rendering, pseudocode analysis and step-by-step explanations.</p><a class="btn primary" href="#/section/' + esc(sid) + '">Back to ' + esc(sec.name) + '</a></section>';
      $('#main').innerHTML = html;
      return;
    }

    var c = t.content;
    html += '<div class="topic-layout">';
    html += '<article class="topic-article" id="topic-article">';
    html += '<header class="topic-head"><h1>' + esc(t.title) + '</h1>' +
      '<div class="topic-actions"><button class="btn ghost small" data-action="review" data-on="' + (isViewed(sid, tid) ? '1' : '0') + '">' + (isViewed(sid, tid) ? '✓ Reviewed' : 'Mark as reviewed') + '</button>' +
      '<a class="btn ghost small" href="#/section/' + esc(sid) + '">Back to section</a></div></header>';

    (c.introduction || []).forEach(function (p) { html += R.richPara(p).replace(/<p>/g, '<p class="intro-p">'); });

    (c.sections || []).forEach(function (sec_, i) {
      html += '<section class="topic-section" id="sec-' + (sec_.id || i) + '">';
      html += '<h2><span class="sec-idx">' + String(i + 1).padStart(2, '0') + '</span>' + esc(sec_.title) + '</h2>';
      (sec_.blocks || []).forEach(function (b) { html += R.renderBlock(b); });
      html += '</section>';
    });

    if (c.quickRevision && c.quickRevision.length) {
      html += '<section class="quick-revision" id="sec-quick"><h2><span class="sec-idx">QR</span>Quick revision</h2><ul>';
      c.quickRevision.forEach(function (q) { html += '<li>' + R.rich(q) + '</li>'; });
      html += '</ul></section>';
    }

    if (c.practiceQuestions && c.practiceQuestions.length) {
      html += '<section class="practice" id="sec-practice"><h2><span class="sec-idx">PQ</span>Practice</h2>';
      c.practiceQuestions.forEach(function (pq, i) {
        html += '<div class="pq-item"><div class="pq-q"><span class="pq-num">Q' + (i + 1) + '</span><p>' + R.rich(pq.prompt) + '</p></div>';
        if (pq.options && pq.options.length) {
          html += '<div class="pq-options">';
          pq.options.forEach(function (o, oi) {
            var letter = String.fromCharCode(65 + oi);
            html += '<span class="pq-option" data-answer="' + letter + '" data-correct="' + (pq.answer === letter ? '1' : '0') + '">' + letter + '. ' + R.rich(o) + '</span>';
          });
          html += '</div>';
        }
        html += '<div class="pq-reveal" hidden><span class="mini-label">Answer: ' + esc(pq.answer) + '</span><p>' + R.rich(pq.explanation) + '</p></div>';
        html += '</div>';
      });
      html += '</section>';
    }

    if (c.companyNote) {
      html += '<aside class="company-note"><header>' + R.icon('bomb') + '<strong>Accenture interview note</strong></header><p>' + R.rich(c.companyNote) + '</p></aside>';
    }

    var idx = sec.topics.indexOf(t);
    var prevT = sec.topics[idx - 1], nextT = sec.topics[idx + 1];
    html += '<nav class="topic-nav">';
    if (prevT) html += '<a class="tn-prev" href="#/topic/' + esc(sid) + '/' + esc(prevT.id) + '"><span class="tn-label">Previous</span><span class="tn-name">' + esc(prevT.title) + '</span></a>';
    else html += '<span></span>';
    if (nextT) html += '<a class="tn-next" href="#/topic/' + esc(sid) + '/' + esc(nextT.id) + '"><span class="tn-label">Next</span><span class="tn-name">' + esc(nextT.title) + '</span></a>';
    else html += '<span></span>';
    html += '</nav>';

    html += '</article>';

    var toc = (c.sections || []).map(function (sec_, i) {
      return '<a href="#sec-' + esc(sec_.id || i) + '"><span class="toc-idx">' + String(i + 1).padStart(2, '0') + '</span>' + esc(sec_.title) + '</a>';
    }).join('');
    if (c.quickRevision) toc += '<a href="#sec-quick"><span class="toc-idx">QR</span>Quick revision</a>';
    if (c.practiceQuestions) toc += '<a href="#sec-practice"><span class="toc-idx">PQ</span>Practice</a>';
    html += '<aside class="toc"><div class="toc-inner"><p class="toc-label">On this page</p>' + toc + '</div></aside>';
    html += '</div>';

    $('#main').innerHTML = html;
    setupTopicInteractions();
  }

  function setupTopicInteractions() {
    var art = $('#topic-article');
    var reviewBtn = $('[data-action="review"]');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', function () {
        var on = this.getAttribute('data-on') === '1';
        markViewed(state.section.id, state.topic.id, !on);
        this.setAttribute('data-on', on ? '0' : '1');
        this.textContent = on ? 'Mark as reviewed' : '✓ Reviewed';
      });
    }

    $$('.pq-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var item = this.closest('.pq-item');
        var reveal = $('.pq-reveal', item);
        $$('.pq-option', item).forEach(function (o) { o.classList.remove('correct', 'wrong'); });
        $$('.pq-option', item).forEach(function (o) {
          if (o.getAttribute('data-correct') === '1') o.classList.add('correct');
          else if (o === this) o.classList.add('wrong');
        }.bind(this));
        if (reveal) reveal.hidden = false;
      });
    });

    // TOC scrollspy
    var links = $$('.toc a');
    if ('IntersectionObserver' in window && links.length) {
      var map = {};
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) map[e.target.id] = true;
        });
        var current = Object.keys(map).filter(function (k) { return map[k]; }).pop();
        if (current) {
          links.forEach(function (l) { l.classList.toggle('active', l.getAttribute('href') === '#' + current); });
        }
      }, { rootMargin: '-20% 0px -70% 0px' });
      $$('.topic-section, .quick-revision, .practice', art).forEach(function (secEl) { obs.observe(secEl); });
    }
  }

  /* ---------- router ---------- */

  function route() {
    var h = location.hash || '#/';
    var m;
    $$('.nav-link').forEach(function (l) { l.classList.remove('active'); });
    if ((m = h.match(/^#\/topic\/([^/]+)\/([^/]+)$/))) {
      $$('.nav-link[data-nav="sec-' + m[1] + '"]').forEach(function (l) { l.classList.add('active'); });
      return viewTopic(m[1], m[2]);
    }
    if ((m = h.match(/^#\/section\/([^/]+)$/))) {
      $$('.nav-link[data-nav="sec-' + m[1] + '"]').forEach(function (l) { l.classList.add('active'); });
      return viewSection(m[1]);
    }
    $$('.nav-link[data-nav="home"]').forEach(function (l) { l.classList.add('active'); });
    viewDashboard();
  }

  /* ---------- global interactions ---------- */

  function setupShell() {
    $('#theme-btn').addEventListener('click', function () {
      var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(t);
      this.innerHTML = t === 'dark' ? moonIco() : sunIco();
    });
    $('#menu-btn').addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
    $('#nav-overlay').addEventListener('click', function () {
      document.body.classList.remove('nav-open');
    });
    $$('.nav-link').forEach(function (l) {
      l.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });

    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-action]');
      if (!target) return;
      var action = target.getAttribute('data-action');
      if (action === 'copy') {
        var block = target.closest('.code-block');
        var codeEl = block ? block.querySelector('code') : null;
        var text = codeEl ? codeEl.textContent : (block && block.querySelector('.code-body') ? block.querySelector('.code-body').textContent : '');
        navigator.clipboard.writeText(text).then(function () {
          var label = target.querySelector('.copy-label');
          if (label) { label.textContent = 'Copied'; setTimeout(function () { label.textContent = 'Copy'; }, 1500); }
        }).catch(function () {});
      }
      if (action === 'toggle-problems') {
        var block = target.closest('.code-block');
        var problems = block && block.querySelector('.code-problems');
        if (problems) {
          var hidden = problems.hasAttribute('hidden');
          problems.toggleAttribute('hidden');
          target.setAttribute('aria-expanded', String(!hidden));
        }
      }
    });
  }

  /* ---------- boot ---------- */

  function boot() {
    loadTheme();
    loadViewed();
    setupShell();
    var loadEl = $('#main');
    loadEl.innerHTML = '<div class="boot"><div class="boot-spinner" aria-hidden="true"></div><p>Loading syllabus…</p></div>';
    fetch('data/syllabus.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        state.syllabus = json;
        var navSec = $('#nav-sections');
        if (navSec) {
          navSec.innerHTML = json.sections.map(function (sec) {
            var done = sec.topics.filter(function (t) { return isViewed(sec.id, t.id); }).length;
            return '<a class="nav-link" data-nav="sec-' + esc(sec.id) + '" href="#/section/' + esc(sec.id) + '">' +
              (ICONS[sec.icon] || ICONS.book) +
              '<span class="nav-text">' + esc(sec.name) + '</span>' +
              (done ? '<span class="nav-count">' + done + '</span>' : '') +
              '</a>';
          }).join('');
          $$('.nav-link', navSec).forEach(function (l) {
            l.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
          });
        }
        window.addEventListener('hashchange', route);
        route();
        document.title = json.meta.title + ' — ' + json.meta.subtitle;
      })
      .catch(function (err) {
        loadEl.innerHTML = '<section class="topic-empty-lg"><div class="empty-art">' + ICONS.warn + '</div><h1>Could not load syllabus</h1><p>' + esc(err.message) + ' — serve this page over HTTP (not file://) or check that <code>accenture/data/syllabus.json</code> exists.</p><button class="btn primary" onclick="location.reload()">Retry</button></section>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
