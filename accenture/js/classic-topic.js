/* ClassicTopic — exact classic bank topic view (Learn / Formulas / Practice /
 * MCQ), ported verbatim from the bank app (js/app.js) and rendered inside a
 * .classic-topic wrapper fed by the scoped classic stylesheet. */
(function () {
  'use strict';

  var container = null;
  var currentTopicId = null;
  var topicCache = {};

  var st = {
    currentSection: 'learn',
    currentStepIndex: 0,
    expandedStep: null,
    currentMcqIndex: 0,
    currentMcqFilter: 'all',
    currentMcqDifficulty: 'all',
    mcqCorrectTotal: 0,
    mcqWrongTotal: 0,
    currentPracticeFormulaId: null,
    currentPracticeIndex: 0,
    mathRenderPending: false
  };

  var progress = (function () {
    try { return JSON.parse(localStorage.getItem('aptitudeProgress')) || {}; } catch (e) { return {}; }
  })();

  /* ---------- data / progress ---------- */

  function getTopic(id) { return topicCache[id] || null; }

  function getTopicProgress(topicId) {
    return progress[topicId] || { sections: {}, formulas: {}, practice: {}, mcq: 0, totalMcq: 0 };
  }

  function updateTopicProgress(topicId, area, key, value) {
    if (!progress[topicId]) progress[topicId] = { sections: {}, formulas: {}, practice: {}, mcq: 0, totalMcq: 0 };
    if (area === 'mcq') {
      progress[topicId].mcq = (progress[topicId].mcq || 0) + value;
      var topic = getTopic(topicId);
      if (topic) progress[topicId].totalMcq = topic.mcqs.length;
    } else if (area === 'sections' && key) {
      progress[topicId].sections[key] = value;
    } else if (area === 'formulas' && key) {
      progress[topicId].formulas[key] = value;
    } else if (area === 'practice' && key) {
      progress[topicId].practice[key] = value;
    }
    saveProgress();
  }

  function saveProgress() {
    try { localStorage.setItem('aptitudeProgress', JSON.stringify(progress)); } catch (e) {}
  }

  /* ---------- rendering helpers (verbatim from the bank app) ---------- */

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function stripReferences(value) {
    return String(value == null ? '' : value).replace(/\[reference:\d+\]/gi, '');
  }

  function stripEmoji(value) {
    return String(value == null ? '' : value)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u200D]/gu, '')
      .replace(/[\uFE0F\uFE0E]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function displayIcon(icon, fallback) {
    var clean = stripEmoji(icon);
    return escapeHtml(clean || fallback || '•');
  }

  function renderText(value) {
    return escapeHtml(stripEmoji(stripReferences(value)));
  }

  function renderInlineMath(value) {
    if (Array.isArray(value)) return value.map(renderInlineMath).join('<br>');
    if (window.Prose && Prose.inline) return Prose.inline(value);
    return renderText(value).replace(/\n/g, '<br>');
  }

  function renderFormula(formula) {
    var latex = formula && typeof formula === 'object' ? formula.latex : null;
    var legacy = formula && typeof formula === 'object' ? formula.text : formula;
    var compactLegacyMath = typeof legacy === 'string'
      && /^[A-Za-z0-9\s()+\-*/=^_.,]+$/.test(legacy)
      && /[=^_]/.test(legacy)
      && !/[A-Za-z]{2,}/.test(legacy);
    var mathSource = latex || (typeof legacy === 'string' && (legacy.includes('\\') || compactLegacyMath) ? legacy : null);
    if (mathSource) return '<div class="formula-math">$$' + escapeHtml(mathSource) + '$$</div>';
    return '<div class="formula-plain" role="note">' + renderText(legacy) + '</div>';
  }

  function renderCallout(label, value, type) {
    if (!value) return '';
    return '<aside class="learning-callout ' + (type || 'note') + '"><span class="callout-label">' + escapeHtml(label) + '</span><p>' + renderInlineMath(value) + '</p></aside>';
  }

  function renderWorkedExample(example) {
    if (!example) return '';
    if (typeof example === 'string' || Array.isArray(example)) return formatSteps(example, true);
    var html = example.prompt ? '<p class="example-prompt">' + renderInlineMath(example.prompt) + '</p>' : '';
    if (Array.isArray(example.steps) && example.steps.length) {
      html += '<div class="solution-steps">' + example.steps.map(function (step) {
        return '<div class="solution-step"><p>' + renderInlineMath(step) + '</p></div>';
      }).join('') + '</div>';
    }
    if (example.answer) html += '<p class="example-answer"><strong>Answer:</strong> ' + renderInlineMath(example.answer) + '</p>';
    return html;
  }

  function renderNumberedSteps(lines) {
    if (window.Prose && Prose.numbered) return Prose.numbered(lines);
    return '<div class="solution-steps">' + lines.filter(Boolean).map(function (line, index) {
      return '<div class="solution-step"><p>' + renderInlineMath(line.trim()) + '</p></div>';
    }).join('') + '</div>';
  }

  function splitWhiteboardLines(text) {
    var sentences = String(text)
      .replace(/\s+/g, ' ')
      .trim()
      .split(/(?<=[.!?])\s+(?=(?:[A-Z]|['“]))|\s*;\s*/)
      .filter(Boolean);

    return sentences.flatMap(function (sentence) {
      return sentence
        .split(/\s*(?:→|⇒)\s*/)
        .flatMap(function (part) {
          var equalSigns = (part.match(/\s=\s/g) || []).length;
          return equalSigns >= 2 ? part.split(/\s(?==\s)/) : [part];
        })
        .map(function (part) { return part.trim(); })
        .filter(Boolean);
    });
  }

  function formatSteps(text, asWhiteboard) {
    if (window.Prose && Prose.steps) return Prose.steps(text, asWhiteboard);
    if (text === null || text === undefined) return '';
    if (Array.isArray(text)) {
      return asWhiteboard
        ? renderNumberedSteps(text)
        : text.filter(Boolean).map(function (paragraph) { return '<p class="prose-para">' + renderInlineMath(paragraph) + '</p>'; }).join('');
    }
    var raw = stripEmoji(stripReferences(text)).trim();
    if (!raw) return '';

    var stepPattern = /(?:^|\s)(?:step\s*(\d+)\s*(?:\([^)]*\))?|\(?\s*(\d+)\s*\))\s*[:.\-]\s*/gi;
    var matches = Array.from(raw.matchAll(stepPattern));
    if (!matches.length) {
      if (asWhiteboard) return renderNumberedSteps(splitWhiteboardLines(raw));
      return raw.split(/\n\s*\n+/).filter(Boolean)
        .map(function (paragraph) { return '<p class="prose-para">' + renderInlineMath(paragraph.trim()) + '</p>'; })
        .join('');
    }

    var html = '<div class="solution-steps">';
    var preamble = raw.slice(0, matches[0].index).trim();
    if (preamble) html += '<p class="solution-intro">' + renderInlineMath(preamble) + '</p>';

    matches.forEach(function (match, index) {
      var start = match.index + match[0].length;
      var end = index + 1 < matches.length ? matches[index + 1].index : raw.length;
      var content = raw.slice(start, end).trim();
      var number = match[1] || match[2] || (index + 1);
      html += '<div class="solution-step"><p>' + renderInlineMath(content) + '</p></div>';
    });
    return html + '</div>';
  }

  function extractExamples(text) {
    if (!text) return { mainText: text || '', examples: [] };
    if (Array.isArray(text)) return { mainText: text, examples: [] };
    var markers = ['Example:', 'Example.', 'Examples:', 'Eg:', 'e.g.:', 'E.g.:'];
    var parts = [];
    var remaining = String(text);

    while (true) {
      var earliestIdx = remaining.length;
      var matchedMarker = null;
      for (var mi = 0; mi < markers.length; mi++) {
        var idx = remaining.indexOf(markers[mi]);
        if (idx !== -1 && idx < earliestIdx) {
          earliestIdx = idx;
          matchedMarker = markers[mi];
        }
      }
      if (matchedMarker === null) break;

      if (earliestIdx > 0) {
        parts.push({ type: 'text', content: remaining.slice(0, earliestIdx).trim() });
      }
      var exampleRaw = remaining.slice(earliestIdx + matchedMarker.length).trim();
      var endIdx = exampleRaw.search(/\b(?:Example:|Examples:|Common |More |Learn |Memorize |Also |Note:)\b/);
      if (endIdx === -1) endIdx = exampleRaw.length;
      var exampleContent = exampleRaw.slice(0, endIdx).trim();
      parts.push({ type: 'example', content: exampleContent });
      remaining = endIdx >= exampleRaw.length ? '' : exampleRaw.slice(endIdx).trim();
    }

    if (remaining.trim()) parts.push({ type: 'text', content: remaining.trim() });

    var mainTexts = parts.filter(function (p) { return p.type === 'text'; }).map(function (p) { return p.content; });
    var examples = parts.filter(function (p) { return p.type === 'example'; }).map(function (p) { return p.content; });

    return { mainText: mainTexts.join(' '), examples: examples };
  }

  /* ---------- math ---------- */

  function renderMath() {
    if (!container) return;
    if (!window.renderMathInElement) {
      if (!st.mathRenderPending) {
        st.mathRenderPending = true;
        window.addEventListener('load', function () {
          st.mathRenderPending = false;
          renderMath();
        }, { once: true });
      }
      return;
    }
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\(', right: '\\)', display: false },
        { left: '\\[', right: '\\]', display: true }
      ],
      throwOnError: false,
      strict: 'ignore',
      trust: false,
      ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
      ignoredClasses: ['katex', 'math-rendered']
    });
  }

  function setContent(html) {
    if (!container) return;
    container.innerHTML = html;
    renderMath();
  }

  /* ---------- toast (classic styling, container appended to the wrapper) ---------- */

  var toastTimeout;
  function showToast(message, type) {
    if (!container) return;
    var toastBox = container.querySelector('.toast-container');
    if (!toastBox) {
      toastBox = document.createElement('div');
      toastBox.className = 'toast-container';
      container.appendChild(toastBox);
    }
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || 'info');
    toast.textContent = message;
    toastBox.appendChild(toast);

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
  }

  /* ---------- view: topic ---------- */

  function getLearningPath(topic) {
    if (Array.isArray(topic.learningPath) && topic.learningPath.length) return topic.learningPath;
    return (topic.readingSections || []).map(function (section, index) {
      return { sectionId: section.id, type: section.type || (index === 0 ? 'concept' : 'guided') };
    });
  }

  function renderTopic() {
    var topic = getTopic(currentTopicId);
    if (!topic) return;

    var p = getTopicProgress(topic.id);
    var mcqPct = topic.mcqs.length ? Math.round(Math.min(p.mcq || 0, topic.mcqs.length) / topic.mcqs.length * 100) : 0;

    var html = '';
    html += '<div class="classic-topic' + (document.documentElement.getAttribute('data-theme') === 'dark' ? ' dark' : '') + '">';
    html += '<div class="page-content">';
    html += '<div class="topic-header glass" style="--topic-color:' + escapeHtml(topic.color || '#4F46E5') + '">';
    html += '<div class="topic-header-info">';
    html += '<h1 class="text-2xl fw-700">' + displayIcon(topic.icon, '') + ' ' + renderText(topic.title) + '</h1>';
    html += '<ul class="topic-header-subtopics">' + (topic.subtopics || []).map(function (s) { return '<li>' + renderText(s) + '</li>'; }).join('') + '</ul>';
    html += '</div>';
    html += '<div class="topic-header-stats">';
    html += '<span>Days ' + escapeHtml(topic.days || '—') + '</span>';
    html += '<span>' + escapeHtml(topic.estimatedHours || '—') + 'hrs</span>';
    html += '<span>' + mcqPct + '% complete</span>';
    html += '</div>';
    html += '</div>';

    html += '<div class="topic-tabs">';
    html += '<button class="tab-btn ' + (st.currentSection === 'learn' ? 'active' : '') + '" data-section="learn" onclick="ClassicTopic.switchSection(\'learn\')">Learn</button>';
    html += '<button class="tab-btn ' + (st.currentSection === 'formulas' ? 'active' : '') + '" data-section="formulas" onclick="ClassicTopic.switchSection(\'formulas\')">Formulas</button>';
    html += '<button class="tab-btn ' + (st.currentSection === 'practice' ? 'active' : '') + '" data-section="practice" onclick="ClassicTopic.switchSection(\'practice\')">Practice</button>';
    html += '<button class="tab-btn ' + (st.currentSection === 'mcq' ? 'active' : '') + '" data-section="mcq" onclick="ClassicTopic.switchSection(\'mcq\')">MCQ (' + topic.mcqs.length + ')</button>';
    html += '</div>';

    html += '<div class="topic-section" id="topic-section">';
    html += renderSectionContent(topic.id);
    html += '</div>';
    html += '</div>';
    html += '</div>';

    setContent(html);
  }

  function renderSectionContent(topicId) {
    var topic = getTopic(topicId);
    if (!topic) return '';
    switch (st.currentSection) {
      case 'learn': return renderLearnPath(topic);
      case 'formulas': return renderFormulas(topic);
      case 'practice': return renderPractice(topic);
      case 'mcq': return renderMcq(topic);
      default: return renderLearnPath(topic);
    }
  }

  function renderLearnPath(topic) {
    var path = getLearningPath(topic);
    var progress_ = getTopicProgress(topic.id);
    var completedSteps = path.filter(function (step, i) {
      var section = topic.readingSections.find(function (s) { return s.id === step.sectionId; });
      return section && progress_.sections[section.id];
    }).length;
    var percentComplete = path.length ? Math.round(completedSteps / path.length * 100) : 0;

    var html = '';
    html += '<div class="learning-path">';
    html += '<div class="path-header">';
    html += '<h2>' + displayIcon(topic.icon, '') + ' ' + renderText(topic.title) + '</h2>';
    html += '<div class="path-progress">';
    html += '<span>' + completedSteps + '/' + path.length + '</span>';
    html += '<div class="progress-bar thin"><div style="width:' + percentComplete + '%"></div></div>';
    html += '</div></div>';
    html += '<div class="path-steps">';

    path.forEach(function (step, index) {
      var section = topic.readingSections.find(function (s) { return s.id === step.sectionId; });
      if (!section) return;
      var isCompleted = progress_.sections[section.id] || false;
      var isActive = index === st.currentStepIndex;
      var isExpanded = st.expandedStep === section.id || (st.expandedStep === null && isActive);
      html += '<div class="path-step ' + (isCompleted ? 'completed ' : '') + (isActive ? 'active ' : '') + '">';
      html += '<div class="step-indicator">' + (index + 1) + '</div>';
      html += '<div class="step-content">';
      html += '<div class="step-title" onclick="ClassicTopic.toggleStep(\'' + topic.id + '\',\'' + section.id + '\')">';
      html += '<span class="step-badge ' + escapeHtml(step.type) + '">' + escapeHtml(String(step.type).toUpperCase()) + '</span>';
      html += renderText(section.title);
      html += '<span class="step-status">' + (isCompleted ? 'Done' : '') + '</span>';
      html += '</div>';
      html += '<div class="step-body ' + (isExpanded ? 'expanded' : '') + '">';
      html += renderSectionContentForPath(topic.id, section);
      html += '</div>';
      html += '</div></div>';
    });

    html += '</div>';
    html += '<div class="path-navigation">';
    html += '<button class="btn btn-outline" onclick="ClassicTopic.prevStep()" ' + (st.currentStepIndex === 0 ? 'disabled' : '') + '>Previous</button>';
    html += '<button class="btn btn-primary" onclick="ClassicTopic.nextStep()" ' + (st.currentStepIndex >= path.length - 1 ? 'disabled' : '') + '>Next</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  function renderSectionContentForPath(topicId, section) {
    var progress_ = getTopicProgress(topicId);
    var isCompleted = progress_.sections[section.id] || false;
    var introParsed = extractExamples(section.content);
    var introMain = introParsed.mainText;
    var introExamples = introParsed.examples;

    var html = '<div class="reading-intro">';
    html += section.quickSummary ? renderCallout('Key idea', section.quickSummary, 'definition') : '';
    html += introMain ? '<div class="reading-prose">' + formatSteps(introMain) + '</div>' : '';
    html += section.whyThisMatters ? renderCallout('Why it matters', section.whyThisMatters, 'tip') : '';
    html += section.pattern ? renderCallout('How to recognise it', section.pattern, 'pattern') : '';
    html += '</div>';

    if (introExamples.length) {
      html += '<div class="reading-examples-block"><span class="reading-examples-label">Examples</span>';
      html += introExamples.map(function (ex) { return '<div class="reading-example-item">' + formatSteps(ex, true) + '</div>'; }).join('');
      html += '</div>';
    }

    html += '<ul class="reading-bullets">';
    (section.subsections || []).forEach(function (sub) {
      var subParsed = extractExamples(sub.content);
      var subMain = subParsed.mainText;
      var subExamples = subParsed.examples;
      html += '<li>';
      html += '<strong class="sub-title">' + renderText(sub.title) + '</strong>';
      html += '<div class="sub-body">';
      html += '<div class="sub-main-text">' + formatSteps(subMain) + '</div>';
      if (subExamples.length || sub.example) {
        html += '<div class="example-block">';
        html += '<span class="example-label">' + (subExamples.length > 1 ? 'Examples' : 'Worked example') + '</span>';
        html += subExamples.map(function (ex) { return '<div class="example-item">' + formatSteps(ex, true) + '</div>'; }).join('');
        html += sub.example ? '<div class="example-item">' + renderWorkedExample(sub.example) + '</div>' : '';
        html += '</div>';
      }
      html += '</div></li>';
    });
    html += '</ul>';

    if (Array.isArray(section.quickRevision) && section.quickRevision.length) {
      html += '<aside class="revision-card"><span class="callout-label">Quick revision</span><ul>' + section.quickRevision.map(function (item) { return '<li>' + renderInlineMath(item) + '</li>'; }).join('') + '</ul></aside>';
    }
    if (Array.isArray(section.tricks) && section.tricks.length) {
      html += '<aside class="revision-card tricks-card"><span class="callout-label">Tips, tricks &amp; shortcuts</span><ul>' + section.tricks.map(function (item) { return '<li>' + renderInlineMath(item) + '</li>'; }).join('') + '</ul></aside>';
    }
    if (Array.isArray(section.patterns) && section.patterns.length) {
      html += '<aside class="revision-card patterns-card"><span class="callout-label">Patterns to recognise</span><ul>' + section.patterns.map(function (item) { return '<li>' + renderInlineMath(item) + '</li>'; }).join('') + '</ul></aside>';
    }
    if (Array.isArray(section.pyqPatterns) && section.pyqPatterns.length) {
      html += '<div class="pyq-block"><span class="callout-label">Previous-year patterns</span>' + section.pyqPatterns.map(function (item) {
        return '<div class="pyq-item"><strong>' + renderInlineMath(item.source || 'Asked in exams') + '</strong><p>' + renderInlineMath(item.question) + '</p><p class="pyq-approach">' + renderInlineMath(item.approach) + '</p></div>';
      }).join('') + '</div>';
    }
    if (section.companyNote) html += renderCallout('Exam note', section.companyNote, 'tip');
    html += '<button class="btn btn-primary btn-sm path-mark-btn" onclick="event.stopPropagation();ClassicTopic.markSectionRead(\'' + topicId + '\',\'' + section.id + '\')">';
    html += isCompleted ? 'Completed' : 'Mark as Read';
    html += '</button>';
    return html;
  }

  function renderFormulas(topic) {
    var html = '<div class="formula-section-heading"><p class="eyebrow">Formula library</p><h2>Understand, apply, and remember</h2><p>Each formula is separated from its context and example so you can scan it quickly during revision.</p></div><div class="formulas-grid">';
    topic.formulas.forEach(function (f, i) {
      html += '<article class="formula-card glass">';
      html += '<div class="formula-card-header"><span class="formula-number">' + String(i + 1).padStart(2, '0') + '</span><h3 class="formula-title">' + renderText(f.title) + '</h3></div>';
      html += '<div class="formula-box">' + renderFormula(f.formula) + '</div>';
      if (f.whenToUse) html += renderCallout('Use it when', f.whenToUse, 'use');
      if (f.explanation) html += '<div class="formula-explanation"><h4>How it works</h4>' + formatSteps(f.explanation, true) + '</div>';
      if (f.example) html += '<div class="formula-example"><span class="example-label">Worked example</span><div class="example-content">' + renderWorkedExample(f.example) + '</div></div>';
      if (f.theTrick || f.memoryTip) html += renderCallout('Memory cue', f.theTrick || f.memoryTip, 'tip');
      if (f.commonMistake) html += renderCallout('Common mistake', f.commonMistake, 'warning');
      html += '</article>';
    });
    return html + '</div>';
  }

  function renderPractice(topic) {
    var formulas = topic.formulas;
    var allProblems = topic.practiceProblems;

    if (!st.currentPracticeFormulaId) {
      var html = '<h3 class="mb-4">Pick a formula to start practicing</h3><div class="formulas-grid">';
      formulas.forEach(function (f, i) {
        var probs = allProblems[f.id] || [];
        var done = Object.keys(getTopicProgress(topic.id).practice || {}).filter(function (k) { return k.indexOf(f.id + ':') === 0; }).length;
        html += '<div class="formula-card glass" onclick="ClassicTopic.selectPracticeFormula(\'' + topic.id + '\',\'' + f.id + '\')">';
        html += '<div class="formula-number">#' + (i + 1) + '</div>';
        html += '<div class="formula-title">' + renderText(f.title) + '</div>';
        html += '<div class="formula-box">' + renderFormula(f.formula) + '</div>';
        html += '<div class="formula-meta">' + done + '/' + probs.length + ' done</div>';
        html += '</div>';
      });
      return html + '</div>';
    }

    var currentFormula = formulas.find(function (f) { return f.id === st.currentPracticeFormulaId; });
    var problems = allProblems[st.currentPracticeFormulaId] || [];
    var idx = st.currentPracticeIndex;
    var problem = problems[idx];
    if (!problems.length) return '<div class="empty-state">No practice problems for this formula</div>';
    if (!problem) return '<div class="empty-state">Problem not found</div>';

    var isMcq = Array.isArray(problem.opts);

    var html = '';
    html += '<button class="btn btn-ghost mb-3" onclick="ClassicTopic.backToFormulaList(\'' + topic.id + '\')">Back to formulas</button>';
    if (currentFormula) {
      html += '<div class="practice-formula-card glass">';
      html += '<div class="formula-title">' + renderText(currentFormula.title) + '</div>';
      html += '<div class="formula-box">' + renderFormula(currentFormula.formula) + '</div>';
      if (currentFormula.example) html += '<div class="formula-howto"><span class="example-label">How to use this formula (step by step)</span>' + renderWorkedExample(currentFormula.example) + '</div>';
      if (currentFormula.memoryTip || currentFormula.theTrick) html += renderCallout('Memory cue', currentFormula.theTrick || currentFormula.memoryTip, 'tip');
      html += '</div>';
    }
    html += '<div class="practice-nav">';
    html += '<button class="btn btn-outline" onclick="ClassicTopic.prevPractice()" ' + (idx === 0 ? 'disabled' : '') + '>Prev</button>';
    html += '<span class="practice-counter">' + (idx + 1) + ' / ' + problems.length + '</span>';
    html += '<button class="btn btn-outline" onclick="ClassicTopic.nextPractice()" ' + (idx >= problems.length - 1 ? 'disabled' : '') + '>Next</button>';
    html += '</div>';
    html += '<div class="practice-card glass">';
    html += '<div class="practice-header">';
    html += '<span class="badge medium">Practice</span>';
    html += '<span class="practice-number">Q' + (idx + 1) + '</span>';
    html += '</div>';
    html += '<div class="practice-question">' + formatSteps(problem.q) + '</div>';

    if (isMcq) {
      html += '<div class="mcq-options" id="practice-options">';
      html += problem.opts.map(function (opt, oi) {
        return '<button class="mcq-option" data-index="' + oi + '" onclick="ClassicTopic.checkPracticeAnswer(\'' + topic.id + '\',\'' + st.currentPracticeFormulaId + '\',' + idx + ',' + oi + ',this)">' +
          '<span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>' +
          '<span class="option-text">' + renderInlineMath(opt) + '</span></button>';
      }).join('');
      html += '</div>';
      html += '<div class="mcq-feedback" id="practice-feedback" style="display:none">';
      html += '<div class="mcq-result" id="practice-result"></div>';
      html += '<div class="practice-solution" id="practice-solution">';
      html += '<h4>Step-by-step solution</h4>';
      html += '<div class="practice-solution-steps">';
      html += (problem.s || []).map(function (step) { return '<div class="solution-step"><p>' + renderInlineMath(step) + '</p></div>'; }).join('');
      html += '</div>';
      html += '<div class="practice-answer"><strong>Answer:</strong> ' + renderInlineMath(problem.a) + '</div>';
      if (problem.shortcut) html += renderCallout('Shortcut', problem.shortcut, 'tip');
      if (problem.pattern) html += renderCallout('Pattern to spot', problem.pattern, 'pattern');
      html += '<button class="btn btn-success btn-sm mt-2" onclick="ClassicTopic.markPracticeDone(\'' + topic.id + '\',\'' + st.currentPracticeFormulaId + '\',' + idx + ')">Mark as Done</button>';
      html += '</div></div>';
    } else {
      html += '<button class="btn btn-primary mt-2" onclick="ClassicTopic.toggleSolution(\'' + st.currentPracticeFormulaId + '\',' + idx + ')">Show Solution</button>';
      html += '<div class="practice-solution" id="solution-' + st.currentPracticeFormulaId + '-' + idx + '">';
      html += '<h4>Step-by-Step Solution:</h4>';
      html += '<div class="practice-solution-steps">';
      html += (problem.s || []).map(function (step) { return '<div class="solution-step"><p>' + renderInlineMath(step) + '</p></div>'; }).join('');
      html += '</div>';
      html += '<div class="practice-answer"><strong>Answer:</strong> ' + renderInlineMath(problem.a) + '</div>';
      html += '<button class="btn btn-success btn-sm mt-2" onclick="ClassicTopic.markPracticeDone(\'' + topic.id + '\',\'' + st.currentPracticeFormulaId + '\',' + idx + ')">Mark as Done</button>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function getGrade(pct) {
    if (pct >= 90) return { grade: 'A+', color: 'var(--color-success)' };
    if (pct >= 80) return { grade: 'A', color: 'var(--color-success)' };
    if (pct >= 70) return { grade: 'B', color: '#3B82F6' };
    if (pct >= 60) return { grade: 'C', color: '#F59E0B' };
    if (pct >= 40) return { grade: 'D', color: '#EF4444' };
    return { grade: 'F', color: 'var(--color-error)' };
  }

  function renderMcq(topic) {
    var mcqs = topic.mcqs;
    if (!mcqs.length) return '<div class="empty-state">No MCQs available</div>';

    var filtered = mcqs;
    if (st.currentMcqFilter !== 'all') filtered = mcqs.filter(function (m) { return m.t === st.currentMcqFilter; });
    if (st.currentMcqDifficulty !== 'all') filtered = filtered.filter(function (m) { return (m.d || 'easy') === st.currentMcqDifficulty; });
    var diffWeight = { easy: 0, medium: 1, hard: 2 };
    filtered = Array.from(filtered).sort(function (a, b) { return (diffWeight[a.d] || 0) - (diffWeight[b.d] || 0); });

    var subtopics = Array.from(new Set(mcqs.map(function (m) { return m.t; }).filter(Boolean)));
    var difficulties = Array.from(new Set(mcqs.map(function (m) { return m.d; }).filter(Boolean)));

    var idx = Math.min(st.currentMcqIndex, filtered.length - 1);
    var mcq = filtered[idx];
    if (!mcq) return '<div class="empty-state">No MCQs match filter</div>';

    var p = getTopicProgress(topic.id);
    var totalAttempted = st.mcqCorrectTotal + st.mcqWrongTotal;
    var scorePct = totalAttempted ? Math.round(st.mcqCorrectTotal / totalAttempted * 100) : 0;
    var grade = getGrade(scorePct);

    var html = '';
    html += '<div class="mcq-controls-row">';
    html += '<div class="mcq-stats-bar">';
    html += '<span>Questions: ' + filtered.length + '</span>';
    html += '<span>Answered: ' + (p.mcq || 0) + '</span>';
    html += '<span>Progress: ' + Math.min(Math.round((p.mcq || 0) / mcqs.length * 100), 100) + '%</span>';
    html += '</div>';
    html += '<div class="mcq-score-badge" title="Correct:' + st.mcqCorrectTotal + ' Wrong:' + st.mcqWrongTotal + '">';
    html += '<span>Correct: ' + st.mcqCorrectTotal + '</span>';
    html += '<span>Wrong: ' + st.mcqWrongTotal + '</span>';
    html += '<span class="mcq-grade" style="color:' + grade.color + ';font-weight:700;">' + grade.grade + '</span>';
    html += '</div>';
    html += '<button class="btn btn-reset-progress" onclick="ClassicTopic.resetMcqProgress(\'' + topic.id + '\')" title="Reset MCQ progress">Reset</button>';
    html += '</div>';
    html += '<div class="mcq-filter-chips">';
    html += '<button class="chip ' + (st.currentMcqFilter === 'all' ? 'chip-active' : '') + '" onclick="ClassicTopic.filterMcq(\'' + topic.id + '\',\'all\')">All</button>';
    html += subtopics.map(function (t) { return '<button class="chip ' + (st.currentMcqFilter === t ? 'chip-active' : '') + '" onclick="ClassicTopic.filterMcq(\'' + topic.id + '\',\'' + escapeHtml(t) + '\')">' + renderText(t) + '</button>'; }).join('');
    html += '</div>';
    if (difficulties.length) {
      html += '<div class="mcq-filter-chips diff-row">';
      html += ['easy', 'medium', 'hard'].map(function (d) {
        return difficulties.indexOf(d) >= 0 ? '<button class="chip chip-' + d + ' ' + (st.currentMcqDifficulty === d ? 'chip-active' : '') + '" onclick="ClassicTopic.filterMcqDifficulty(\'' + topic.id + '\',\'' + d + '\')">' + d + '</button>' : '';
      }).join('');
      html += '<button class="chip ' + (st.currentMcqDifficulty === 'all' ? 'chip-active' : '') + '" onclick="ClassicTopic.filterMcqDifficulty(\'' + topic.id + '\',\'all\')">All levels</button>';
      html += '</div>';
    }
    html += '<div class="mcq-nav">';
    html += '<button class="btn btn-outline" onclick="ClassicTopic.prevMcq(\'' + topic.id + '\')" ' + (idx === 0 ? 'disabled' : '') + '>Prev</button>';
    html += '<span class="mcq-counter">' + (idx + 1) + ' / ' + filtered.length + '</span>';
    html += '<button class="btn btn-outline" onclick="ClassicTopic.nextMcq(\'' + topic.id + '\')" ' + (idx >= filtered.length - 1 ? 'disabled' : '') + '>Next</button>';
    html += '</div>';
    html += '<div class="mcq-card glass" id="mcq-card">';
    html += '<div class="mcq-header">';
    html += '<span class="badge primary">' + renderText(topic.title || 'Number System') + '</span>';
    html += '<span class="badge ' + (mcq.d || 'easy') + '">' + (mcq.d || 'easy') + '</span>';
    if (mcq.source) html += '<span class="mcq-source">' + renderText(mcq.source) + '</span>';
    html += '<span class="mcq-number">Q' + (idx + 1) + '</span>';
    html += '</div>';
    html += '<div class="mcq-question">' + formatSteps(mcq.q) + '</div>';
    html += '<div class="mcq-options" id="mcq-options">';
    html += mcq.opts.map(function (opt, oi) {
      return '<button class="mcq-option" data-index="' + oi + '" onclick="ClassicTopic.checkMcqAnswer(\'' + topic.id + '\',' + idx + ',' + oi + ',this)">' +
        '<span class="option-letter">' + String.fromCharCode(65 + oi) + '</span>' +
        '<span class="option-text">' + renderInlineMath(opt) + '</span></button>';
    }).join('');
    html += '</div>';
    html += '<div class="mcq-feedback" id="mcq-feedback" style="display:none">';
    html += '<div class="mcq-result" id="mcq-result"></div>';
    html += '<div class="mcq-explanation" id="mcq-explanation"></div>';
    html += '<div class="mcq-score" id="mcq-score" style="display:none"></div>';
    html += '<button class="btn btn-primary mt-2" onclick="ClassicTopic.nextMcq(\'' + topic.id + '\')">Next Question</button>';
    html += '</div>';
    html += '</div>';
    return html;
  }

  /* ---------- handlers (verbatim from the bank app) ---------- */

  function switchSection(section) {
    st.currentSection = section;
    st.currentPracticeFormulaId = null;
    st.currentPracticeIndex = 0;
    renderTopic();
  }

  function toggleStep(topicId, sectionId) {
    st.expandedStep = st.expandedStep === sectionId ? null : sectionId;
    renderTopic();
  }

  function markSectionRead(topicId, sectionId) {
    updateTopicProgress(topicId, 'sections', sectionId, true);
    st.expandedStep = null;
    var topic = getTopic(topicId);
    if (topic) {
      var path = getLearningPath(topic);
      var currentIdx = path.findIndex(function (s) { return s.sectionId === sectionId; });
      if (currentIdx >= 0 && currentIdx < path.length - 1) {
        st.currentStepIndex = currentIdx + 1;
      }
    }
    renderTopic();
    showToast('Section marked as read!', 'success');
  }

  function nextStep() {
    var topic = getTopic(currentTopicId);
    if (!topic) return;
    var path = getLearningPath(topic);
    if (st.currentStepIndex < path.length - 1) {
      st.currentStepIndex++;
      renderTopic();
    }
  }

  function prevStep() {
    if (st.currentStepIndex > 0) {
      st.currentStepIndex--;
      renderTopic();
    }
  }

  function selectPracticeFormula(topicId, formulaId) {
    st.currentPracticeFormulaId = formulaId;
    st.currentPracticeIndex = 0;
    renderTopic();
  }

  function backToFormulaList(topicId) {
    st.currentPracticeFormulaId = null;
    st.currentPracticeIndex = 0;
    renderTopic();
  }

  function toggleSolution(formulaId, idx) {
    var el = document.getElementById('solution-' + formulaId + '-' + idx);
    if (el) el.classList.toggle('expanded');
  }

  function checkPracticeAnswer(topicId, formulaId, idx, selected, el) {
    var topic = getTopic(topicId);
    if (!topic) return;
    var problem = (topic.practiceProblems[formulaId] || [])[idx];
    if (!problem || !Array.isArray(problem.opts)) return;

    document.querySelectorAll('#practice-options .mcq-option').forEach(function (btn) {
      btn.disabled = true;
      var oi = parseInt(btn.dataset.index, 10);
      if (oi === problem.c) btn.classList.add('correct');
      else if (oi === selected) btn.classList.add('wrong');
    });

    var feedback = document.getElementById('practice-feedback');
    var result = document.getElementById('practice-result');
    if (selected === problem.c) {
      result.innerHTML = '<strong>Correct!</strong>';
      result.style.color = 'var(--color-success)';
    } else {
      result.innerHTML = '<strong>Wrong!</strong> Correct answer: ' + String.fromCharCode(65 + problem.c);
      result.style.color = 'var(--color-error)';
    }
    feedback.style.display = 'block';
    renderMath();
    window.scrollTo({ top: feedback.offsetTop - 80, behavior: 'smooth' });
  }

  function markPracticeDone(topicId, formulaId, idx) {
    updateTopicProgress(topicId, 'practice', formulaId + ':' + idx, true);
    showToast('Practice problem completed!', 'success');
  }

  function nextPractice() {
    var topic = getTopic(currentTopicId);
    if (topic && st.currentPracticeFormulaId) {
      var probs = topic.practiceProblems[st.currentPracticeFormulaId] || [];
      if (st.currentPracticeIndex < probs.length - 1) {
        st.currentPracticeIndex++;
        renderTopic();
      }
    }
  }

  function prevPractice() {
    if (st.currentPracticeIndex > 0) {
      st.currentPracticeIndex--;
      renderTopic();
    }
  }

  function checkMcqAnswer(topicId, idx, selected) {
    var topic = getTopic(topicId);
    if (!topic) return;

    var filtered = topic.mcqs;
    if (st.currentMcqFilter !== 'all') filtered = topic.mcqs.filter(function (m) { return m.t === st.currentMcqFilter; });
    var mcq = filtered[idx];
    if (!mcq) return;

    document.querySelectorAll('.mcq-option').forEach(function (btn) {
      btn.disabled = true;
      var oi = parseInt(btn.dataset.index, 10);
      if (oi === mcq.c) btn.classList.add('correct');
      else if (oi === selected) btn.classList.add('wrong');
    });

    if (selected === mcq.c) {
      updateTopicProgress(topicId, 'mcq', null, 1);
      st.mcqCorrectTotal++;
    } else {
      st.mcqWrongTotal++;
    }

    var feedback = document.getElementById('mcq-feedback');
    var result = document.getElementById('mcq-result');
    var explanation = document.getElementById('mcq-explanation');
    var scoreDiv = document.getElementById('mcq-score');

    if (selected === mcq.c) {
      result.innerHTML = '<strong>Correct!</strong>';
      result.style.color = 'var(--color-success)';
    } else {
      result.innerHTML = '<strong>Wrong!</strong> Correct answer: ' + String.fromCharCode(65 + mcq.c);
      result.style.color = 'var(--color-error)';
    }

    var expHtml = '';
    if (Array.isArray(mcq.exp) || typeof mcq.exp === 'string') {
      expHtml += '<h4 class="explain-title">Step-by-step solution</h4>' + formatSteps(mcq.exp, true);
    }
    if (mcq.shortcut) expHtml += renderCallout('Shortcut', mcq.shortcut, 'tip');
    if (mcq.pattern) expHtml += renderCallout('Pattern to spot', mcq.pattern, 'pattern');
    if (mcq.wrongOptions) expHtml += renderCallout('Why the others are wrong', mcq.wrongOptions, 'warning');
    explanation.innerHTML = expHtml || formatSteps(mcq.exp || 'No explanation available.', true);
    renderMath();
    feedback.style.display = 'block';

    var totalAttempted = st.mcqCorrectTotal + st.mcqWrongTotal;
    if (scoreDiv && totalAttempted > 0) {
      var scorePct = Math.round(st.mcqCorrectTotal / totalAttempted * 100);
      var g = getGrade(scorePct);
      scoreDiv.style.display = 'block';
      scoreDiv.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);">' +
        '<span style="font-size:var(--text-sm);">Score: ' + st.mcqCorrectTotal + '/' + totalAttempted + ' (' + scorePct + '%)</span>' +
        '<span style="font-weight:700;font-size:var(--text-xl);color:' + g.color + ';">Grade: ' + g.grade + '</span></div>';
    }

    updateMcqScoreBadge();
  }

  function nextMcq(topicId) {
    var topic = getTopic(topicId);
    if (!topic) return;
    var filtered = topic.mcqs;
    if (st.currentMcqFilter !== 'all') filtered = topic.mcqs.filter(function (m) { return m.t === st.currentMcqFilter; });
    if (st.currentMcqIndex < filtered.length - 1) {
      st.currentMcqIndex++;
      renderTopic();
    }
  }

  function prevMcq(topicId) {
    if (st.currentMcqIndex > 0) {
      st.currentMcqIndex--;
      renderTopic();
    }
  }

  function filterMcq(topicId, filter) {
    st.currentMcqFilter = filter;
    st.currentMcqIndex = 0;
    renderTopic();
  }

  function filterMcqDifficulty(topicId, difficulty) {
    st.currentMcqDifficulty = difficulty;
    st.currentMcqIndex = 0;
    renderTopic();
  }

  function resetMcqProgress(topicId) {
    if (!window.confirm('Reset all MCQ progress for this topic? This cannot be undone.')) return;
    var p = getTopicProgress(topicId);
    p.mcq = 0;
    p.totalMcq = 0;
    st.currentMcqIndex = 0;
    st.mcqCorrectTotal = 0;
    st.mcqWrongTotal = 0;
    saveProgress();
    renderTopic();
    showToast('MCQ progress reset!', 'info');
  }

  function updateMcqScoreBadge() {
    var badge = container ? container.querySelector('.mcq-score-badge') : null;
    if (!badge) return;
    var totalAttempted = st.mcqCorrectTotal + st.mcqWrongTotal;
    var scorePct = totalAttempted ? Math.round(st.mcqCorrectTotal / totalAttempted * 100) : 0;
    var g = getGrade(scorePct);
    badge.innerHTML = '<span>Correct: ' + st.mcqCorrectTotal + '</span><span>Wrong: ' + st.mcqWrongTotal + '</span><span class="mcq-grade" style="color:' + g.color + ';font-weight:700;">' + g.grade + '</span>';
  }

  /* ---------- public API ---------- */

  function render(el, topic, opts) {
    container = el;
    if (topic.id !== currentTopicId) {
      currentTopicId = topic.id;
      st.currentSection = 'learn';
      st.currentStepIndex = 0;
      st.expandedStep = null;
      st.currentMcqIndex = 0;
      st.currentMcqFilter = 'all';
      st.currentMcqDifficulty = 'all';
      st.mcqCorrectTotal = 0;
      st.mcqWrongTotal = 0;
      st.currentPracticeFormulaId = null;
      st.currentPracticeIndex = 0;
    }
    topicCache[currentTopicId] = topic;
    renderTopic();
  }

  window.ClassicTopic = {
    render: render,
    switchSection: switchSection,
    toggleStep: toggleStep,
    markSectionRead: markSectionRead,
    nextStep: nextStep,
    prevStep: prevStep,
    selectPracticeFormula: selectPracticeFormula,
    backToFormulaList: backToFormulaList,
    toggleSolution: toggleSolution,
    checkPracticeAnswer: checkPracticeAnswer,
    markPracticeDone: markPracticeDone,
    nextPractice: nextPractice,
    prevPractice: prevPractice,
    checkMcqAnswer: checkMcqAnswer,
    nextMcq: nextMcq,
    prevMcq: prevMcq,
    filterMcq: filterMcq,
    filterMcqDifficulty: filterMcqDifficulty,
    resetMcqProgress: resetMcqProgress
  };
})();
