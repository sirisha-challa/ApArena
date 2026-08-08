/* ArenaApp — dashboard / section / topic views for the Accenture preparation page.
 * Hash router: #/ , #/section/:id , #/topic/:sectionId/:topicId */
(function () {
  'use strict';

  var R = window.ArenaRenderer;
  var state = { syllabus: null, section: null, topic: null, viewed: {}, bankTopicCache: {}, mcqIdx: 0 };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* Professional icon set (Lucide, MIT) — shared via ArenaRenderer.ICONS */
  var ICONS = R.ICONS || {};

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
  function sunIco() { return ICONS.sun; }
  function moonIco() { return ICONS.moon; }

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
    html += statCard(5, 'Rounds', 'behavioral · coding · comm');
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
      if (t.bankTopicId) {
        html += '<div class="topic-empty"><p><strong>Bank topic.</strong> Content loads in-app from the ' + esc(t.bank) + ' — Learn, Formulas, Practice &amp; MCQ tabs.</p></div>';
      } else if (!t.content) {
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

    if (t.bankTopicId) { loadBankTopic(t); return; }

    if (!t.content) {
      html += '<section class="topic-empty-lg"><div class="empty-art">' + ICONS.book + '</div><h1>' + esc(t.title) + '</h1><p>This topic has not been uploaded yet. It will appear here with premium math rendering, pseudocode analysis and step-by-step explanations.</p><a class="btn primary" href="#/section/' + esc(sid) + '">Back to ' + esc(sec.name) + '</a></section>';
      $('#main').innerHTML = html;
      return;
    }

    renderTopicContent(sec, t, t.content);
  }

  /* Bank-linked topics: fetch the bank topic JSON and render it in-app with the
   * same Learn / Formulas / Practice / MCQ tab flow the banks use. */
  function loadBankTopic(t) {
    var cached = state.bankTopicCache[t.bankTopicId];
    if (cached) { renderTopicContent(state.section, t, cached); return; }
    $('#main').innerHTML = '<section class="topic-empty-lg"><div class="boot-spinner" aria-hidden="true"></div><h1>' + esc(t.title) + '</h1><p>Loading from ' + esc(t.bank) + '…</p></section>';
    fetch('/data/topics/' + encodeURIComponent(t.bankTopicId) + '.json', { cache: 'no-store' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (json) {
        state.bankTopicCache[t.bankTopicId] = bankTopicToContent(json);
        renderTopicContent(state.section, t, state.bankTopicCache[t.bankTopicId]);
      })
      .catch(function (err) {
        var shell = t.bank === 'Verbal Bank' ? 'verbal' : 'reasoning';
        $('#main').innerHTML = '<section class="topic-empty-lg"><div class="empty-art">' + ICONS.warn + '</div><h1>' + esc(t.title) + '</h1><p>Could not load this topic from the bank (' + esc(err.message) + '). It lives in the ' + esc(t.bank) + '.</p><a class="btn primary" href="/' + shell + '/">Open ' + esc(t.bank) + '</a></section>';
      });
  }

  /* Adapt bank topic schema (readingSections / formulas / practiceProblems /
   * mcqs) to the accenture content schema the topic renderer expects. */
  function bankTopicToContent(bt) {
    var c = { introduction: [], sections: [], practiceQuestions: [], practiceGroups: [], quickRevision: bt.quickRevision || [], mcqs: bt.mcqs || [] };
    (bt.readingSections || []).forEach(function (rs) {
      if (rs.id === 'formulas') return; // rendered as the dedicated Formulas section below
      var blocks = [];
      if (rs.content) blocks.push({ type: 'p', text: rs.content });
      if (rs.quickSummary) blocks.push({ type: 'p', text: rs.quickSummary });
      (rs.subsections || []).forEach(function (sub) {
        blocks.push({ type: 'p', text: '**' + sub.title + '** — ' + sub.content });
      });
      if (rs.tricks && rs.tricks.length) blocks.push({ type: 'callout', kind: 'tip', title: 'Tricks', content: rs.tricks });
      c.sections.push({ id: rs.id, title: rs.title, blocks: blocks });
    });
    if (bt.formulas && bt.formulas.length) {
      c.sections.push({ id: 'formulas', title: 'Formulas', blocks: bt.formulas.map(function (f) {
        var ex = f.example;
        return {
          type: 'formula', title: f.title, latex: f.formula, text: f.explanation,
          whenToUse: f.whenToUse, memoryTip: f.memoryTip, commonMistake: f.commonMistake,
          example: ex ? { prompt: ex.prompt, steps: (ex.steps || []).map(function (s) { return { text: s, reason: '' }; }), answer: ex.answer } : null
        };
      }) });
    }
    var titles = {};
    (bt.formulas || []).forEach(function (f) { titles[f.id] = f.title; });
    var pp = bt.practiceProblems || {};
    Object.keys(pp).forEach(function (fid) {
      c.practiceGroups.push({
        title: titles[fid] || fid,
        problems: pp[fid].map(function (p) {
          return {
            prompt: p.q,
            options: p.opts || [],
            answer: String.fromCharCode(65 + (p.c || 0)),
            explanation: (p.a ? 'Correct answer: ' + p.a + '. ' : '') + (p.s || []).join(' ')
          };
        })
      });
    });
    return c;
  }

  function renderTopicContent(sec, t, c) {
    var sid = sec.id, tid = t.id;
    state.topicTab = state.topicTab || 'learn';

    var formulaBlocks = [];
    (c.sections || []).forEach(function (sec_) {
      (sec_.blocks || []).forEach(function (b) { if (b.type === 'formula') formulaBlocks.push(b); });
    });
    var practiceCount = c.practiceGroups ? c.practiceGroups.reduce(function (a, g) { return a + g.problems.length; }, 0) : (c.practiceQuestions ? c.practiceQuestions.length : 0);

    var html = '';
    html += '<div class="topic-layout">';
    html += '<article class="topic-article" id="topic-article">';
    html += '<header class="topic-head"><h1>' + esc(t.title) + '</h1>' +
      '<div class="topic-actions"><button class="btn ghost small" data-action="review" data-on="' + (isViewed(sid, tid) ? '1' : '0') + '">' + (isViewed(sid, tid) ? '<span class="svg-ico">' + ICONS.check + '</span>Reviewed' : 'Mark as reviewed') + '</button>' +
      '<a class="btn ghost small" href="#/section/' + esc(sid) + '">Back to section</a></div></header>';

    html += '<div class="topic-tabs">';
    html += '<button class="tab-btn' + (state.topicTab === 'learn' ? ' active' : '') + '" data-tab="learn">Learn</button>';
    html += '<button class="tab-btn' + (state.topicTab === 'formulas' ? ' active' : '') + '" data-tab="formulas">Formulas (' + formulaBlocks.length + ')</button>';
    html += '<button class="tab-btn' + (state.topicTab === 'practice' ? ' active' : '') + '" data-tab="practice">Practice (' + practiceCount + ')</button>';
    if (c.mcqs && c.mcqs.length) {
      html += '<button class="tab-btn' + (state.topicTab === 'mcq' ? ' active' : '') + '" data-tab="mcq">MCQ (' + c.mcqs.length + ')</button>';
    }
    if (c.quickRevision && c.quickRevision.length) {
      html += '<button class="tab-btn' + (state.topicTab === 'quick' ? ' active' : '') + '" data-tab="quick">Quick revision</button>';
    }
    html += '</div>';

    html += '<div class="topic-section" id="topic-section">';

    if (state.topicTab === 'formulas') {
      if (formulaBlocks.length) {
        html += '<div class="formulas-grid">';
        formulaBlocks.forEach(function (b) { html += R.renderBlock(b); });
        html += '</div>';
      } else {
        html += '<div class="empty-state">No formulas in this topic yet.</div>';
      }
    } else if (state.topicTab === 'practice') {
      var groups = c.practiceGroups && c.practiceGroups.length
        ? c.practiceGroups
        : (c.practiceQuestions && c.practiceQuestions.length ? [{ title: null, problems: c.practiceQuestions }] : []);
      if (groups.length) {
        groups.forEach(function (g) {
          if (g.title) html += '<h3 class="pq-group-title">' + esc(g.title) + '</h3>';
          g.problems.forEach(function (pq, i) {
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
            if (!(pq.options && pq.options.length)) html += '<button class="btn ghost small" data-action="toggle-answer">Show answer</button>';
            html += '</div>';
          });
        });
      } else {
        html += '<div class="empty-state">No practice questions in this topic yet.</div>';
      }
    } else if (state.topicTab === 'mcq') {
      html += renderMcqTab(c.mcqs);
    } else if (state.topicTab === 'quick') {
      html += '<section class="quick-revision"><ul>';
      c.quickRevision.forEach(function (q) { html += '<li>' + R.rich(q) + '</li>'; });
      html += '</ul></section>';
    } else {
      (c.introduction || []).forEach(function (p) { html += R.richPara(p).replace(/<p>/g, '<p class="intro-p">'); });

      (c.sections || []).forEach(function (sec_, i) {
        html += '<section class="topic-section-inner" id="sec-' + (sec_.id || i) + '">';
        html += '<h2><span class="sec-idx">' + String(i + 1).padStart(2, '0') + '</span>' + esc(sec_.title) + '</h2>';
        (sec_.blocks || []).forEach(function (b) { html += R.renderBlock(b); });
        html += '</section>';
      });

      if (c.companyNote) {
        html += '<aside class="company-note"><header>' + R.icon('bomb') + '<strong>Accenture interview note</strong></header><p>' + R.rich(c.companyNote) + '</p></aside>';
      }
    }

    html += '</div>';

    var idx = sec.topics.indexOf(t);
    var prevT = sec.topics[idx - 1], nextT = sec.topics[idx + 1];
    html += '<nav class="topic-nav">';
    if (prevT) html += '<a class="tn-prev" href="#/topic/' + esc(sid) + '/' + esc(prevT.id) + '"><span class="tn-label">Previous</span><span class="tn-name">' + esc(prevT.title) + '</span></a>';
    else html += '<span></span>';
    if (nextT) html += '<a class="tn-next" href="#/topic/' + esc(sid) + '/' + esc(nextT.id) + '"><span class="tn-label">Next</span><span class="tn-name">' + esc(nextT.title) + '</span></a>';
    else html += '<span></span>';
    html += '</nav>';

    html += '</article>';
    html += '</div>';

    $('#main').innerHTML = html;
    setupTopicInteractions();
  }

  /* Simple one-at-a-time MCQ flow reusing the practice option styles. */
  function renderMcqTab(mcqs) {
    if (!mcqs || !mcqs.length) return '<div class="empty-state">No MCQs in this topic yet.</div>';
    var mi = Math.min(state.mcqIdx || 0, mcqs.length - 1);
    var m = mcqs[mi];
    var html = '<div class="mcq-controls-row">';
    html += '<span class="mcq-counter">Question ' + (mi + 1) + ' of ' + mcqs.length + '</span>';
    html += '<span class="mcq-tag">' + esc(m.t || 'General') + (m.d ? ' &middot; ' + esc(m.d) : '') + '</span>';
    html += '<button class="btn ghost small" data-mcq-prev' + (mi === 0 ? ' disabled' : '') + '>Prev</button>';
    html += '<button class="btn ghost small" data-mcq-next' + (mi >= mcqs.length - 1 ? ' disabled' : '') + '>Next</button>';
    html += '</div>';
    html += '<div class="pq-item mcq-item">';
    html += '<div class="pq-q"><span class="pq-num">Q' + (mi + 1) + '</span><p>' + R.rich(m.q) + '</p></div>';
    html += '<div class="pq-options">';
    m.opts.forEach(function (o, oi) {
      var letter = String.fromCharCode(65 + oi);
      html += '<span class="pq-option" data-answer="' + letter + '" data-correct="' + (m.c === oi ? '1' : '0') + '">' + letter + '. ' + R.rich(o) + '</span>';
    });
    html += '</div>';
    html += '<div class="pq-reveal" hidden><span class="mini-label">Answer: ' + esc(m.opts[m.c] != null ? m.opts[m.c] : String.fromCharCode(65 + m.c)) + '</span><p>' + R.rich(m.exp) + '</p></div>';
    html += '</div>';
    return html;
  }

  function setupTopicInteractions() {
    var reviewBtn = $('[data-action="review"]');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', function () {
        var on = this.getAttribute('data-on') === '1';
        markViewed(state.section.id, state.topic.id, !on);
        this.setAttribute('data-on', on ? '0' : '1');
        this.innerHTML = on ? 'Mark as reviewed' : '<span class="svg-ico">' + ICONS.check + '</span>Reviewed';
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

    $$('[data-action="toggle-answer"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var reveal = $('.pq-reveal', this.closest('.pq-item'));
        if (reveal) reveal.hidden = !reveal.hidden;
      });
    });

    $$('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.topicTab = this.getAttribute('data-tab');
        viewTopic(state.section.id, state.topic.id);
        window.scrollTo(0, 0);
      });
    });

    var prevBtn = $('[data-mcq-prev]');
    if (prevBtn && !prevBtn.disabled) {
      prevBtn.addEventListener('click', function () {
        state.mcqIdx = Math.max(0, (state.mcqIdx || 0) - 1);
        viewTopic(state.section.id, state.topic.id);
      });
    }
    var nextBtn = $('[data-mcq-next]');
    if (nextBtn && !nextBtn.disabled) {
      nextBtn.addEventListener('click', function () {
        state.mcqIdx = (state.mcqIdx || 0) + 1;
        viewTopic(state.section.id, state.topic.id);
      });
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
