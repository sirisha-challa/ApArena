(function() {
'use strict';

const state = {
  currentView: 'dashboard',
  currentTopicId: null,
  currentSection: 'learn',
  currentStepIndex: 0,
  expandedStep: null,
  currentMcqIndex: 0,
  currentMcqFilter: 'all',
  currentMcqResults: [],
  mcqCorrectTotal: 0,
  mcqWrongTotal: 0,
  currentPracticeFormulaId: null,
  currentPracticeIndex: 0,
  currentFormulaIndex: 0,
  topicDataCache: {},
  progress: JSON.parse(localStorage.getItem('aptitudeProgress')) || {},
  sidebarOpen: window.innerWidth > 1024,
  darkMode: localStorage.getItem('aptitudeDarkMode') === 'true',
  restoringHistory: false,
  mathRenderPending: false
};

function init() {
  if (!window.TOPICS_INDEX) {
    document.getElementById('header-title').textContent = 'Error';
    setContent('<div class="page-content"><div class="empty-state">Failed to load data. Please refresh or check console for errors.</div></div>');
    return;
  }
  applyTheme();
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  updateHamburger();
  renderSidebar();
  renderBottomNav();
  renderDashboard();
  bindEvents();
  history.replaceState(getRouteState(), '', window.location.href);
}

function renderMath() {
  const container = document.getElementById('app-content');
  if (!container) return;
  if (!window.renderMathInElement) {
    if (!state.mathRenderPending) {
      state.mathRenderPending = true;
      window.addEventListener('load', () => {
        state.mathRenderPending = false;
        renderMath();
      }, { once: true });
    }
    return;
  }
  renderMathInElement(container, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false},
      {left: '\\(', right: '\\)', display: false},
      {left: '\\[', right: '\\]', display: true}
    ],
    throwOnError: false,
    strict: 'ignore',
    trust: false,
    ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    ignoredClasses: ['katex', 'math-rendered']
  });
}

function setContent(html) {
  const container = document.getElementById('app-content');
  if (!container) return;
  container.innerHTML = html;
  renderMath();
}

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
  const clean = stripEmoji(icon);
  return escapeHtml(clean || fallback || '•');
}

function renderText(value) {
  return escapeHtml(stripEmoji(stripReferences(value)));
}

function renderInlineMath(value) {
  if (Array.isArray(value)) return value.map(renderInlineMath).join('<br>');
  // use enhanced prose renderer for inline markdown
  if (window.Prose && Prose.inline) return Prose.inline(value);
  return renderText(value).replace(/\n/g, '<br>');
}

function renderFormula(formula) {
  const latex = formula && typeof formula === 'object' ? formula.latex : null;
  const legacy = formula && typeof formula === 'object' ? formula.text : formula;
  const compactLegacyMath = typeof legacy === 'string'
    && /^[A-Za-z0-9\s()+\-*/=^_.,]+$/.test(legacy)
    && /[=^_]/.test(legacy)
    && !/[A-Za-z]{2,}/.test(legacy);
  const mathSource = latex || (typeof legacy === 'string' && (legacy.includes('\\') || compactLegacyMath) ? legacy : null);
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
  let html = example.prompt ? '<p class="example-prompt">' + renderInlineMath(example.prompt) + '</p>' : '';
  if (Array.isArray(example.steps) && example.steps.length) {
    html += '<div class="solution-steps">' + example.steps.map((step, index) =>
      '<div class="solution-step"><p>' + renderInlineMath(step) + '</p></div>'
    ).join('') + '</div>';
  }
  if (example.answer) html += '<p class="example-answer"><strong>Answer:</strong> ' + renderInlineMath(example.answer) + '</p>';
  return html;
}

function getRouteState() {
  return {
    view: state.currentView,
    topicId: state.currentTopicId,
    section: state.currentSection,
    practiceFormulaId: state.currentPracticeFormulaId,
    practiceIndex: state.currentPracticeIndex,
    mcqIndex: state.currentMcqIndex,
    mcqFilter: state.currentMcqFilter,
    stepIndex: state.currentStepIndex
  };
}

function pushRoute() {
  if (!state.restoringHistory) history.pushState(getRouteState(), '', window.location.href);
  updateBackButton();
}

function updateBackButton() {
  const button = document.getElementById('back-button');
  if (!button) return;
  button.hidden = state.currentView === 'dashboard';
}

function applyTheme() {
  document.documentElement.classList.toggle('dark', state.darkMode);
  document.getElementById('theme-toggle').innerHTML = state.darkMode
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
}

function getTopicProgress(topicId) {
  return state.progress[topicId] || { sections: {}, formulas: {}, practice: {}, mcq: 0, totalMcq: 0 };
}

function updateTopicProgress(topicId, area, key, value) {
  if (!state.progress[topicId]) state.progress[topicId] = { sections: {}, formulas: {}, practice: {}, mcq: 0, totalMcq: 0 };
  if (area === 'mcq') {
    state.progress[topicId].mcq = (state.progress[topicId].mcq || 0) + value;
    const topic = getTopic(topicId);
    if (topic) state.progress[topicId].totalMcq = topic.mcqs.length;
  } else if (area === 'sections' && key) {
    state.progress[topicId].sections[key] = value;
  } else if (area === 'formulas' && key) {
    state.progress[topicId].formulas[key] = value;
  } else if (area === 'practice' && key) {
    state.progress[topicId].practice[key] = value;
  }
  saveProgress();
  updateSidebarProgress();
}

function saveProgress() {
  localStorage.setItem('aptitudeProgress', JSON.stringify(state.progress));
}

function getOverallProgress() {
  const topics = TOPICS_INDEX.topics;
  let total = 0, done = 0;
  topics.forEach(t => {
    const topic = getTopic(t.id);
    if (!topic) return;
    const p = getTopicProgress(t.id);
    const practiceCount = Object.values(topic.practiceProblems).reduce((sum, arr) => sum + arr.length, 0);
    total += (topic.readingSections.length || 0) + (topic.formulas.length || 0) + practiceCount + (topic.mcqs.length || 0);
    done += Object.keys(p.sections).length + Object.keys(p.formulas).length + Object.keys(p.practice).length + (p.mcq || 0);
  });
  total = Math.max(total, 1);
  return Math.round(done / total * 100);
}

function getTopic(id) {
  if (state.topicDataCache[id]) return state.topicDataCache[id];
  return null;
}

function getTopicIndex(id) {
  return TOPICS_INDEX.topics.find(t => t.id === id);
}

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const categories = TOPICS_INDEX.categories || [];
  const topics = TOPICS_INDEX.topics;
  let html = '';

  if (categories.length) {
    categories.forEach(cat => {
      const catTopics = topics.filter(t => t.category === cat.id);
      if (!catTopics.length) return;
      html += `<div class="sidebar-section-label">${renderText(cat.title)}</div>`;
      catTopics.forEach(t => {
        const p = getTopicProgress(t.id);
        const topic = getTopic(t.id);
        const mcqTotal = topic ? topic.mcqs.length : 1;
        const mcqDone = Math.min(p.mcq || 0, mcqTotal);
        const pct = Math.round(mcqDone / mcqTotal * 100);
        html += `<button class="sidebar-item ${state.currentTopicId===t.id?'active':''}" data-topic="${t.id}" onclick="APP.navigate('topic','${t.id}')">
          <span class="sidebar-item-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
          <span class="sidebar-item-text">${renderText(t.title)}</span>
          <span class="sidebar-item-status" style="background:${pct>=100?'#10B981':pct>0?'#F59E0B':'#CBD5E1'}"></span>
        </button>`;
      });
    });
  } else {
    html += '<div class="sidebar-section-label">Topics</div>';
    topics.forEach(t => {
      const p = getTopicProgress(t.id);
      const topic = getTopic(t.id);
      const mcqTotal = topic ? topic.mcqs.length : 1;
      const mcqDone = Math.min(p.mcq || 0, mcqTotal);
      const pct = Math.round(mcqDone / mcqTotal * 100);
      html += `<button class="sidebar-item ${state.currentTopicId===t.id?'active':''}" data-topic="${t.id}" onclick="APP.navigate('topic','${t.id}')">
          <span class="sidebar-item-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
          <span class="sidebar-item-text">${renderText(t.title)}</span>
        <span class="sidebar-item-status" style="background:${pct>=100?'#10B981':pct>0?'#F59E0B':'#CBD5E1'}"></span>
      </button>`;
    });
  }

  nav.innerHTML = html;
  updateSidebarProgress();
}

function updateSidebarProgress() {
  const pct = getOverallProgress();
  document.getElementById('sidebar-progress-fill').style.width = pct + '%';
  document.getElementById('sidebar-progress-text').textContent = pct + '%';
}

function renderBottomNav() {
  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.view === state.currentView);
  });
}

function renderDashboard() {
  state.currentView = 'dashboard';
  document.getElementById('header-title').textContent = 'Dashboard';
  const content = document.getElementById('app-content');
  const topics = TOPICS_INDEX.topics;
  const categories = TOPICS_INDEX.categories || [];
  const completed = topics.filter(t => (getTopicProgress(t.id).mcq||0) >= (getTopic(t.id)?.mcqs?.length || 0)).length;

  let html = `
  <div class="page-content">
    <div class="dashboard-grid">
      <div class="dashboard-header">
        <div>
          <h1 class="text-2xl fw-700">Placement Preparation Hub</h1>
          <p class="text-muted">Aptitude + Verbal & English — Complete Campus Placement Training</p>
        </div>
        <div class="dashboard-stats">
          <div class="stat-card glass">
            <span class="stat-value">${completed}/${topics.length}</span>
            <span class="stat-label">Topics Completed</span>
          </div>
          <div class="stat-card glass">
            <span class="stat-value">${getOverallProgress()}%</span>
            <span class="stat-label">Overall Progress</span>
          </div>
        </div>
      </div>`;

  if (categories.length) {
    categories.forEach((cat, catIdx) => {
      const catTopics = topics.filter(t => t.category === cat.id);
      if (!catTopics.length) return;
      html += `
      <div class="category-section">
        <h2 class="category-title" style="color:${cat.color}">${displayIcon(cat.icon, '')} ${renderText(cat.title)}</h2>
        <p class="text-muted category-subtitle">${renderText(cat.subtitle)}</p>
        <div class="bento-grid">`;

      catTopics.forEach((t, ti) => {
        const p = getTopicProgress(t.id);
        const topic = getTopic(t.id);
        const mcqTotal = topic ? topic.mcqs.length : 1;
        const mcqPct = mcqTotal ? Math.round(Math.min(p.mcq||0, mcqTotal)/mcqTotal*100) : 0;
        const globalIdx = catIdx * 10 + ti;
        html += `
        <div class="topic-card glass bento-${(globalIdx%4)+1}" style="--topic-color:${t.color || cat.color}" onclick="APP.navigate('topic','${t.id}')">
          <div class="topic-card-header">
            <span class="topic-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
            <span class="topic-days">${t.days}</span>
          </div>
          <h3 class="topic-title">${renderText(t.title)}</h3>
          <div class="topic-subtopics">${renderText(t.subtopics.slice(0,3).join(' · '))}</div>
          <div class="progress-bar"><div style="width:${mcqPct}%"></div></div>
          <div class="topic-meta">
            <span>${t.estimatedHours}h</span>
            <span>${mcqPct}%</span>
          </div>
        </div>`;
      });

      html += `</div></div>`;
    });
  } else {
    html += `<div class="bento-grid">`;
    topics.forEach(t => {
      const p = getTopicProgress(t.id);
      const topic = getTopic(t.id);
      const mcqTotal = topic ? topic.mcqs.length : 1;
      const mcqPct = mcqTotal ? Math.round(Math.min(p.mcq||0, mcqTotal)/mcqTotal*100) : 0;
      html += `
      <div class="topic-card glass bento-${topics.indexOf(t)%4+1}" style="--topic-color:${t.color}" onclick="APP.navigate('topic','${t.id}')">
        <div class="topic-card-header">
          <span class="topic-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
          <span class="topic-days">${t.days}</span>
        </div>
        <h3 class="topic-title">${renderText(t.title)}</h3>
        <div class="topic-subtopics">${renderText(t.subtopics.slice(0,3).join(' · '))}</div>
        <div class="progress-bar"><div style="width:${mcqPct}%"></div></div>
        <div class="topic-meta">
          <span>${t.estimatedHours}h</span>
          <span>${mcqPct}%</span>
        </div>
      </div>`;
    });
    html += `</div>`;
  }

  html += `
    </div>
  </div>`;

  setContent(html);
  renderBottomNav();
  updateBackButton();
}

function renderRoadmap() {
  state.currentView = 'roadmap';
  document.getElementById('header-title').textContent = 'Roadmap';
  const content = document.getElementById('app-content');
  const topics = TOPICS_INDEX.topics;
  const categories = TOPICS_INDEX.categories || [];

  let html = `
  <div class="page-content">
    <h1 class="text-2xl fw-700 mb-4">Study Plan</h1>
    <p class="text-muted mb-6">Master All Topics: Learn - Practice - Speed.</p>
    <div class="roadmap-container">`;

  if (categories.length) {
    categories.forEach(cat => {
      const catTopics = topics.filter(t => t.category === cat.id);
      if (!catTopics.length) return;
      html += `
      <div class="month-section">
        <h2 class="month-title">${displayIcon(cat.icon, '')} ${renderText(cat.title)}</h2>
        <div class="roadmap">`;

      catTopics.forEach((t) => {
        const p = getTopicProgress(t.id);
        const topic = getTopic(t.id);
        const mcqTotal = topic ? topic.mcqs.length : 1;
        const mcqPct = mcqTotal ? Math.round(Math.min(p.mcq||0, mcqTotal)/mcqTotal*100) : 0;
        const status = mcqPct >= 100 ? 'completed' : mcqPct > 0 ? 'in-progress' : 'locked';
        html += `<div class="roadmap-item ${status}" onclick="APP.navigate('topic','${t.id}')">
          <div class="roadmap-dot"></div>
          <div class="roadmap-content">
            <div class="roadmap-header">
              <span class="roadmap-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
              <span class="roadmap-days">Day ${t.days}</span>
              <span class="roadmap-status">${status === 'completed' ? 'DONE' : status === 'in-progress' ? '...' : 'LOCK'}</span>
            </div>
            <h3 class="roadmap-title">${renderText(t.title)}</h3>
            <p class="roadmap-subtopics">${renderText(t.subtopics.join(' · '))}</p>
            <div class="progress-bar"><div style="width:${mcqPct}%"></div></div>
          </div>
        </div>`;
      });

      html += `</div></div>`;
    });
  } else {
    html += `
      <div class="month-section">
        <h2 class="month-title">Number System</h2>
        <div class="roadmap">`;
    topics.forEach((t) => {
      const p = getTopicProgress(t.id);
      const topic = getTopic(t.id);
      const mcqTotal = topic ? topic.mcqs.length : 1;
      const mcqPct = mcqTotal ? Math.round(Math.min(p.mcq||0, mcqTotal)/mcqTotal*100) : 0;
      const status = mcqPct >= 100 ? 'completed' : mcqPct > 0 ? 'in-progress' : 'locked';
      html += `<div class="roadmap-item ${status}" onclick="APP.navigate('topic','${t.id}')">
        <div class="roadmap-dot"></div>
        <div class="roadmap-content">
          <div class="roadmap-header">
            <span class="roadmap-icon">${displayIcon(t.icon, t.title.slice(0, 1))}</span>
            <span class="roadmap-days">Day ${t.days}</span>
            <span class="roadmap-status">${status === 'completed' ? 'DONE' : status === 'in-progress' ? '...' : 'LOCK'}</span>
          </div>
          <h3 class="roadmap-title">${renderText(t.title)}</h3>
          <p class="roadmap-subtopics">${renderText(t.subtopics.join(' · '))}</p>
          <div class="progress-bar"><div style="width:${mcqPct}%"></div></div>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  html += `</div></div>`;
  setContent(html);
  renderBottomNav();
  updateBackButton();
}

function renderTopic(topicOrId) {
  var topic = (typeof topicOrId === 'string') ? getTopic(topicOrId) : topicOrId;
  if (!topic) { renderDashboard(); return; }

  state.currentView = 'topic';
  state.currentTopicId = topic.id;
  state.currentSection = state.currentSection || 'learn';
  document.getElementById('header-title').textContent = stripEmoji(topic.icon) + ' ' + stripEmoji(topic.title);

  const content = document.getElementById('app-content');
  const p = getTopicProgress(topic.id);
  const mcqPct = topic.mcqs.length ? Math.round(Math.min(p.mcq||0, topic.mcqs.length)/topic.mcqs.length*100) : 0;

  let html = `
  <div class="page-content">
    <div class="topic-header glass" style="--topic-color:${topic.color}">
      <div class="topic-header-info">
        <h1 class="text-2xl fw-700">${displayIcon(topic.icon, '')} ${renderText(topic.title)}</h1>
        <p class="text-muted">${renderText(topic.subtopics.join(' · '))}</p>
      </div>
      <div class="topic-header-stats">
        <span>Days ${topic.days}</span>
        <span>${topic.estimatedHours}hrs</span>
        <span>${mcqPct}% complete</span>
      </div>
    </div>

    <div class="topic-tabs">
      <button class="tab-btn ${state.currentSection==='learn'?'active':''}" data-section="learn" onclick="APP.switchSection('learn')">Learn</button>
      <button class="tab-btn ${state.currentSection==='formulas'?'active':''}" data-section="formulas" onclick="APP.switchSection('formulas')">Formulas</button>
      <button class="tab-btn ${state.currentSection==='practice'?'active':''}" data-section="practice" onclick="APP.switchSection('practice')">Practice</button>
      <button class="tab-btn ${state.currentSection==='mcq'?'active':''}" data-section="mcq" onclick="APP.switchSection('mcq')">MCQ (${topic.mcqs.length})</button>
    </div>

    <div class="topic-section" id="topic-section">`;

  html += renderSectionContent(topic.id);
  html += `</div></div>`;
  setContent(html);
  renderSidebar();
  renderBottomNav();
  updateBackButton();
}

function renderSectionContent(topicId) {
  const topic = getTopic(topicId);
  if (!topic) return '';

  switch(state.currentSection) {
    case 'learn': return renderLearnPath(topic);
    case 'formulas': return renderFormulas(topic);
    case 'practice': return renderPractice(topic);
    case 'mcq': return renderMcq(topic);
    default: return renderLearnPath(topic);
  }
}

function renderNumberedSteps(lines) {
  if (window.Prose && Prose.numbered) return Prose.numbered(lines);
  return '<div class="solution-steps">' + lines.filter(Boolean).map((line, index) =>
    '<div class="solution-step"><p>' + renderInlineMath(line.trim()) + '</p></div>'
  ).join('') + '</div>';
}

function splitWhiteboardLines(text) {
  const sentences = String(text)
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+(?=(?:[A-Z]|['“]))|\s*;\s*/)
    .filter(Boolean);

  return sentences.flatMap(sentence => sentence
    .split(/\s*(?:→|⇒)\s*/)
    .flatMap(part => {
      const equalSigns = (part.match(/\s=\s/g) || []).length;
      return equalSigns >= 2 ? part.split(/\s(?==\s)/) : [part];
    })
    .map(part => part.trim())
    .filter(Boolean)
  );
}

function formatSteps(text, asWhiteboard) {
  if (window.Prose && Prose.steps) return Prose.steps(text, asWhiteboard);
  // fallback to original implementation
  if (text === null || text === undefined) return '';
  if (Array.isArray(text)) {
    return asWhiteboard
      ? renderNumberedSteps(text)
      : text.filter(Boolean).map(paragraph => '<p class="prose-para">' + renderInlineMath(paragraph) + '</p>').join('');
  }
  const raw = stripEmoji(stripReferences(text)).trim();
  if (!raw) return '';

  const stepPattern = /(?:^|\s)(?:step\s*(\d+)\s*(?:\([^)]*\))?|\(?\s*(\d+)\s*\))\s*[:.\-]\s*/gi;
  const matches = [...raw.matchAll(stepPattern)];
  if (!matches.length) {
    if (asWhiteboard) return renderNumberedSteps(splitWhiteboardLines(raw));
    return raw.split(/\n\s*\n+/).filter(Boolean)
      .map(paragraph => '<p class="prose-para">' + renderInlineMath(paragraph.trim()) + '</p>')
      .join('');
  }

  let html = '<div class="solution-steps">';
  const preamble = raw.slice(0, matches[0].index).trim();
  if (preamble) html += '<p class="solution-intro">' + renderInlineMath(preamble) + '</p>';

  matches.forEach((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : raw.length;
    const content = raw.slice(start, end).trim();
    const number = match[1] || match[2] || index + 1;
    html += '<div class="solution-step"><p>' + renderInlineMath(content) + '</p></div>';
  });
  return html + '</div>';
}

var renderSteps = formatSteps;

function getLearningPath(topic) {
  if (Array.isArray(topic.learningPath) && topic.learningPath.length) return topic.learningPath;
  return (topic.readingSections || []).map((section, index) => ({
    sectionId: section.id,
    type: section.type || (index === 0 ? 'concept' : 'guided')
  }));
}

function renderLearnPath(topic) {
  const path = getLearningPath(topic);
  const progress = getTopicProgress(topic.id);
  const completedSteps = path.filter((step, i) => {
    const section = topic.readingSections.find(s => s.id === step.sectionId);
    return section && progress.sections[section.id];
  }).length;
  const percentComplete = path.length ? Math.round(completedSteps / path.length * 100) : 0;

  let html = `
    <div class="learning-path">
      <div class="path-header">
        <h2>${displayIcon(topic.icon, '')} ${renderText(topic.title)}</h2>
        <div class="path-progress">
          <span>${completedSteps}/${path.length}</span>
          <div class="progress-bar thin"><div style="width:${percentComplete}%"></div></div>
        </div>
      </div>
      <div class="path-steps">
  `;
  path.forEach((step, index) => {
    const section = topic.readingSections.find(s => s.id === step.sectionId);
    if (!section) return;
    const isCompleted = progress.sections[section.id] || false;
    const isActive = index === state.currentStepIndex;
    const isLocked = false;
    const isExpanded = state.expandedStep === section.id || (state.expandedStep === null && isActive);
    html += `
      <div class="path-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}">
        <div class="step-indicator">${index + 1}</div>
        <div class="step-content">
          <div class="step-title" onclick="APP.toggleStep('${topic.id}','${section.id}')">
            <span class="step-badge ${step.type}">${step.type.toUpperCase()}</span>
            ${renderText(section.title)}
            <span class="step-status">${isCompleted ? 'Done' : ''}</span>
          </div>
          <div class="step-body ${isExpanded ? 'expanded' : ''}">
            ${renderSectionContentForPath(topic.id, section)}
          </div>
        </div>
      </div>
    `;
  });
  html += `
      </div>
      <div class="path-navigation">
        <button class="btn btn-outline" onclick="APP.prevStep()" ${state.currentStepIndex===0?'disabled':''}>Previous</button>
        <button class="btn btn-primary" onclick="APP.nextStep()" ${state.currentStepIndex>=path.length-1?'disabled':''}>Next</button>
      </div>
    </div>
  `;
  return html;
}

function renderSectionContentForPath(topicId, section) {
  var progress = getTopicProgress(topicId);
  var isCompleted = progress.sections[section.id] || false;
  var introParsed = extractExamples(section.content);
  var introMain = introParsed.mainText;
  var introExamples = introParsed.examples;

  let html = '<div class="reading-intro">';
  html += section.quickSummary ? renderCallout('Key idea', section.quickSummary, 'definition') : '';
  html += introMain ? '<div class="reading-prose">' + formatSteps(introMain) + '</div>' : '';
  html += section.whyThisMatters ? renderCallout('Why it matters', section.whyThisMatters, 'tip') : '';
  html += section.pattern ? renderCallout('How to recognise it', section.pattern, 'pattern') : '';
  html += '</div>';
  if (introExamples.length) {
    html += `<div class="reading-examples-block">
      <span class="reading-examples-label">Examples</span>
      ${introExamples.map(ex => `<div class="reading-example-item">${formatSteps(ex, true)}</div>`).join('')}
    </div>`;
  }
  html += `<ul class="reading-bullets">`;
  section.subsections.forEach(sub => {
    var subParsed = extractExamples(sub.content);
    var subMain = subParsed.mainText;
    var subExamples = subParsed.examples;
    html += `
      <li>
        <strong class="sub-title">${renderText(sub.title)}</strong>
        <div class="sub-body">
          <div class="sub-main-text">${formatSteps(subMain)}</div>
          ${subExamples.length || sub.example ? `
          <div class="example-block">
            <span class="example-label">${subExamples.length > 1 ? 'Examples' : 'Worked example'}</span>
            ${subExamples.map(ex => `<div class="example-item">${formatSteps(ex, true)}</div>`).join('')}
            ${sub.example ? `<div class="example-item">${renderWorkedExample(sub.example)}</div>` : ''}
          </div>` : ''}
        </div>
      </li>`;
  });
  html += `</ul>`;
  if (Array.isArray(section.quickRevision) && section.quickRevision.length) {
    html += `<aside class="revision-card"><span class="callout-label">Quick revision</span><ul>${section.quickRevision.map(item => '<li>' + renderInlineMath(item) + '</li>').join('')}</ul></aside>`;
  }
  if (section.companyNote) html += renderCallout('Exam note', section.companyNote, 'tip');
  html += `<button class="btn btn-primary btn-sm path-mark-btn" onclick="event.stopPropagation();APP.markSectionRead('${topicId}','${section.id}')">
    ${isCompleted ? 'Completed' : 'Mark as Read'}
  </button>`;
  return html;
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

    var mainTexts = parts.filter(function(p) { return p.type === 'text'; }).map(function(p) { return p.content; });
    var examples = parts.filter(function(p) { return p.type === 'example'; }).map(function(p) { return p.content; });

    return { mainText: mainTexts.join(' '), examples: examples };
}

function renderFormulas(topic) {
  let html = '<div class="formula-section-heading"><p class="eyebrow">Formula library</p><h2>Understand, apply, and remember</h2><p>Each formula is separated from its context and example so you can scan it quickly during revision.</p></div><div class="formulas-grid">';
  topic.formulas.forEach((f, i) => {
    html += `
      <article class="formula-card glass">
        <div class="formula-card-header"><span class="formula-number">${String(i + 1).padStart(2, '0')}</span><h3 class="formula-title">${renderText(f.title)}</h3></div>
        <div class="formula-box">${renderFormula(f.formula)}</div>
        ${f.whenToUse ? renderCallout('Use it when', f.whenToUse, 'use') : ''}
        ${f.explanation ? `<div class="formula-explanation"><h4>How it works</h4>${formatSteps(f.explanation, true)}</div>` : ''}
        ${f.example ? `<div class="formula-example"><span class="example-label">Worked example</span><div class="example-content">${renderWorkedExample(f.example)}</div></div>` : ''}
        ${f.theTrick || f.memoryTip ? renderCallout('Memory cue', f.theTrick || f.memoryTip, 'tip') : ''}
        ${f.commonMistake ? renderCallout('Common mistake', f.commonMistake, 'warning') : ''}
      </article>`;
  });
  return html + '</div>';
}

function renderPractice(topic) {
  const formulas = topic.formulas;
  const allProblems = topic.practiceProblems;

  if (!state.currentPracticeFormulaId) {
    let html = '<h3 class="mb-4">Pick a formula to start practicing</h3><div class="formulas-grid">';
    formulas.forEach((f, i) => {
      const probs = allProblems[f.id] || [];
      const done = Object.keys(getTopicProgress(topic.id).practice || {}).filter(k => k.startsWith(f.id+':')).length;
      html += `<div class="formula-card glass" onclick="APP.selectPracticeFormula('${topic.id}','${f.id}')">
        <div class="formula-number">#${i+1}</div>
        <div class="formula-title">${renderText(f.title)}</div>
        <div class="formula-box">${renderFormula(f.formula)}</div>
        <div class="formula-meta">${done}/${probs.length} done</div>
      </div>`;
    });
    html += '</div>';
    return html;
  }

  const currentFormula = formulas.find(f => f.id === state.currentPracticeFormulaId);
  const problems = allProblems[state.currentPracticeFormulaId] || [];
  const idx = state.currentPracticeIndex;
  const problem = problems[idx];
  if (!problems.length) return '<div class="empty-state">No practice problems for this formula</div>';
  if (!problem) return '<div class="empty-state">Problem not found</div>';

  let html = `
  <button class="btn btn-ghost mb-3" onclick="APP.backToFormulaList('${topic.id}')">Back to formulas</button>
  ${currentFormula ? `
  <div class="practice-formula-card glass">
    <div class="formula-title">${renderText(currentFormula.title)}</div>
    <div class="formula-box">${renderFormula(currentFormula.formula)}</div>
  </div>` : ''}
  <div class="practice-nav">
    <button class="btn btn-outline" onclick="APP.prevPractice()" ${idx===0?'disabled':''}>Prev</button>
    <span class="practice-counter">${idx+1} / ${problems.length}</span>
    <button class="btn btn-outline" onclick="APP.nextPractice()" ${idx>=problems.length-1?'disabled':''}>Next</button>
  </div>
  <div class="practice-card glass">
    <div class="practice-header">
      <span class="badge medium">Practice</span>
      <span class="practice-number">Q${idx+1}</span>
    </div>
    <div class="practice-question">${formatSteps(problem.q)}</div>
    <button class="btn btn-primary mt-2" onclick="APP.toggleSolution('${state.currentPracticeFormulaId}',${idx})">Show Solution</button>
    <div class="practice-solution" id="solution-${state.currentPracticeFormulaId}-${idx}">
        <h4>Step-by-Step Solution:</h4>
        <div class="practice-solution-steps">
            ${problem.s.map((step, i) => `
            <div class="solution-step">
                <p>${renderInlineMath(step)}</p>
            </div>
            `).join('')}
        </div>
        <div class="practice-answer">
            <strong>Answer:</strong> ${renderInlineMath(problem.a)}
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="APP.markPracticeDone('${topic.id}','${state.currentPracticeFormulaId}',${idx})">
            Mark as Done
        </button>
    </div>
  </div>`;
  return html;
}

function renderMcq(topic) {
  const mcqs = topic.mcqs;
  if (!mcqs.length) return '<div class="empty-state">No MCQs available</div>';

  let filtered = mcqs;
  if (state.currentMcqFilter !== 'all') {
    filtered = mcqs.filter(m => m.t === state.currentMcqFilter);
  }

  const subtopics = [...new Set((mcqs.map(m => m.t)).filter(Boolean))];

  const idx = Math.min(state.currentMcqIndex, filtered.length - 1);
  const mcq = filtered[idx];
  if (!mcq) return '<div class="empty-state">No MCQs match filter</div>';

  const p = getTopicProgress(topic.id);
  const totalAttempted = state.mcqCorrectTotal + state.mcqWrongTotal;
  const scorePct = totalAttempted ? Math.round(state.mcqCorrectTotal / totalAttempted * 100) : 0;
  var grade, gradeColor;
  if (scorePct >= 90) { grade = 'A+'; gradeColor = 'var(--color-success)'; }
  else if (scorePct >= 80) { grade = 'A'; gradeColor = 'var(--color-success)'; }
  else if (scorePct >= 70) { grade = 'B'; gradeColor = '#3B82F6'; }
  else if (scorePct >= 60) { grade = 'C'; gradeColor = '#F59E0B'; }
  else if (scorePct >= 40) { grade = 'D'; gradeColor = '#EF4444'; }
  else { grade = 'F'; gradeColor = 'var(--color-error)'; }

  let html = `
  <div class="mcq-controls-row">
    <div class="mcq-stats-bar">
      <span>Questions: ${filtered.length}</span>
      <span>Answered: ${p.mcq||0}</span>
      <span>Progress: ${Math.min(Math.round((p.mcq||0)/mcqs.length*100),100)}%</span>
    </div>
    <div class="mcq-score-badge" title="Correct:${state.mcqCorrectTotal} Wrong:${state.mcqWrongTotal}">
      <span>Correct: ${state.mcqCorrectTotal}</span>
      <span>Wrong: ${state.mcqWrongTotal}</span>
      <span class="mcq-grade" style="color:${gradeColor};font-weight:700;">${grade}</span>
    </div>
    <button class="btn btn-reset-progress" onclick="APP.resetMcqProgress('${topic.id}')" title="Reset MCQ progress">
      Reset
    </button>
  </div>
  <div class="mcq-nav">
    <button class="btn btn-outline" onclick="APP.prevMcq('${topic.id}')" ${idx===0?'disabled':''}>Prev</button>
    <span class="mcq-counter">${idx+1} / ${filtered.length}</span>
    <button class="btn btn-outline" onclick="APP.nextMcq('${topic.id}')" ${idx>=filtered.length-1?'disabled':''}>Next</button>
  </div>
  <div class="mcq-card glass" id="mcq-card">
    <div class="mcq-header">
      <span class="badge primary">${renderText(topic.title || 'Number System')}</span>
      <span class="mcq-number">Q${idx+1}</span>
    </div>
    <div class="mcq-question">${formatSteps(mcq.q)}</div>
    <div class="mcq-options" id="mcq-options">
      ${mcq.opts.map((opt, oi) => `
        <button class="mcq-option" data-index="${oi}" onclick="APP.checkMcqAnswer('${topic.id}', ${idx}, ${oi}, this)">
          <span class="option-letter">${String.fromCharCode(65+oi)}</span>
          <span class="option-text">${renderInlineMath(opt)}</span>
        </button>
      `).join('')}
    </div>
    <div class="mcq-feedback" id="mcq-feedback" style="display:none">
      <div class="mcq-result" id="mcq-result"></div>
      <div class="mcq-explanation" id="mcq-explanation"></div>
      <div class="mcq-score" id="mcq-score" style="display:none"></div>
      <button class="btn btn-primary mt-2" onclick="APP.nextMcq('${topic.id}')">Next Question</button>
    </div>
  </div>`;
  return html;
}

function loadTopic(topicId, shouldPush) {
  if (state.topicDataCache[topicId]) {
    renderTopic(state.topicDataCache[topicId]);
    if (shouldPush) pushRoute();
    return;
  }
  const indexTopic = TOPICS_INDEX.topics.find(t => t.id === topicId);
  if (!indexTopic) { renderDashboard(); return; }

  document.getElementById('header-title').textContent = 'Loading...';
  setContent('<div class="page-content"><div class="empty-state">Loading topic...</div></div>');

  fetch('data/topics/' + topicId + '.json')
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(data) {
      state.topicDataCache[topicId] = data;
      renderTopic(data);
      if (shouldPush) pushRoute();
    })
    .catch(function(e) {
      console.error('Failed to load topic', e);
      showToast('Error loading topic', 'error');
      renderDashboard();
    });
}

function navigate(view, param) {
  closeSidebar();
  if (view === 'dashboard') {
    state.currentTopicId = null;
    state.currentSection = 'learn';
    renderDashboard();
    pushRoute();
  }
  else if (view === 'roadmap') {
    state.currentTopicId = null;
    renderRoadmap();
    pushRoute();
  }
  else if (view === 'topic') loadTopic(param, true);
}

function switchSection(section) {
  state.currentSection = section;
  state.currentPracticeFormulaId = null;
  state.currentPracticeIndex = 0;
  if (state.currentTopicId) {
    const topic = getTopic(state.currentTopicId);
    if (topic) {
      renderTopic(topic);
      pushRoute();
    }
  }
}

function toggleStep(topicId, sectionId) {
  state.expandedStep = state.expandedStep === sectionId ? null : sectionId;
  const topic = getTopic(topicId);
  if (topic) renderTopic(topic);
}

function markSectionRead(topicId, sectionId) {
  updateTopicProgress(topicId, 'sections', sectionId, true);
  state.expandedStep = null;
  const topic = getTopic(topicId);
  if (topic) {
    const path = getLearningPath(topic);
    const currentIdx = path.findIndex(s => s.sectionId === sectionId);
    if (currentIdx >= 0 && currentIdx < path.length - 1) {
      state.currentStepIndex = currentIdx + 1;
    }
  }
  const topicData = getTopic(topicId);
  if (topicData) renderTopic(topicData);
  showToast('Section marked as read!', 'success');
}

function nextStep() {
  const topic = getTopic(state.currentTopicId);
  if (!topic) return;
  const path = getLearningPath(topic);
  if (state.currentStepIndex < path.length - 1) {
    state.currentStepIndex++;
    renderTopic(topic);
  }
}

function prevStep() {
  if (state.currentStepIndex > 0) {
    state.currentStepIndex--;
    const topic = getTopic(state.currentTopicId);
    if (topic) renderTopic(topic);
  }
}

function selectPracticeFormula(topicId, formulaId) {
  state.currentPracticeFormulaId = formulaId;
  state.currentPracticeIndex = 0;
  const topic = getTopic(topicId);
  if (topic) {
    renderTopic(topic);
    pushRoute();
  }
}

function backToFormulaList(topicId) {
  state.currentPracticeFormulaId = null;
  state.currentPracticeIndex = 0;
  const topic = getTopic(topicId);
  if (topic) {
    renderTopic(topic);
    pushRoute();
  }
}

function toggleSolution(formulaId, idx) {
  const el = document.getElementById(`solution-${formulaId}-${idx}`);
  if (el) el.classList.toggle('expanded');
}

function markPracticeDone(topicId, formulaId, idx) {
  updateTopicProgress(topicId, 'practice', formulaId+':'+idx, true);
  showToast('Practice problem completed!', 'success');
}

function nextPractice() {
  const topic = getTopic(state.currentTopicId);
  if (topic && state.currentPracticeFormulaId) {
    const probs = topic.practiceProblems[state.currentPracticeFormulaId] || [];
    if (state.currentPracticeIndex < probs.length - 1) {
      state.currentPracticeIndex++;
      renderTopic(topic);
    }
  }
}

function prevPractice() {
  if (state.currentPracticeIndex > 0) {
    state.currentPracticeIndex--;
    const topic = getTopic(state.currentTopicId);
    if (topic) renderTopic(topic);
  }
}

function checkMcqAnswer(topicId, idx, selected, el) {
  const topic = getTopic(topicId);
  if (!topic) return;

  let filtered = topic.mcqs;
  if (state.currentMcqFilter !== 'all') {
    filtered = topic.mcqs.filter(m => m.t === state.currentMcqFilter);
  }
  const mcq = filtered[idx];
  if (!mcq) return;

  document.querySelectorAll('.mcq-option').forEach(btn => {
    btn.disabled = true;
    const oi = parseInt(btn.dataset.index);
    if (oi === mcq.c) btn.classList.add('correct');
    else if (oi === selected) btn.classList.add('wrong');
  });

  if (selected === mcq.c) {
    updateTopicProgress(topicId, 'mcq', null, 1);
    state.mcqCorrectTotal++;
  } else {
    state.mcqWrongTotal++;
  }

  const feedback = document.getElementById('mcq-feedback');
  const result = document.getElementById('mcq-result');
  const explanation = document.getElementById('mcq-explanation');
  const scoreDiv = document.getElementById('mcq-score');

  if (selected === mcq.c) {
    result.innerHTML = '<strong>Correct!</strong>';
    result.style.color = 'var(--color-success)';
  } else {
    result.innerHTML = '<strong>Wrong!</strong> Correct answer: ' + String.fromCharCode(65+mcq.c);
    result.style.color = 'var(--color-error)';
  }

  explanation.innerHTML = formatSteps(mcq.exp || 'No explanation available.', true);
  renderMath();
  feedback.style.display = 'block';

  const totalAttempted = state.mcqCorrectTotal + state.mcqWrongTotal;
  if (scoreDiv && totalAttempted > 0) {
    const scorePct = Math.round(state.mcqCorrectTotal / totalAttempted * 100);
    var grade, gradeColor;
    if (scorePct >= 90) { grade = 'A+'; gradeColor = 'var(--color-success)'; }
    else if (scorePct >= 80) { grade = 'A'; gradeColor = 'var(--color-success)'; }
    else if (scorePct >= 70) { grade = 'B'; gradeColor = '#3B82F6'; }
    else if (scorePct >= 60) { grade = 'C'; gradeColor = '#F59E0B'; }
    else if (scorePct >= 40) { grade = 'D'; gradeColor = '#EF4444'; }
    else { grade = 'F'; gradeColor = 'var(--color-error)'; }

    scoreDiv.style.display = 'block';
    scoreDiv.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);">
        <span style="font-size:var(--text-sm);">Score: ${state.mcqCorrectTotal}/${totalAttempted} (${scorePct}%)</span>
        <span style="font-weight:700;font-size:var(--text-xl);color:${gradeColor};">Grade: ${grade}</span>
      </div>`;
  }

  updateMcqScoreBadge();
}

function nextMcq(topicId) {
  const topic = getTopic(topicId);
  if (!topic) return;
  let filtered = topic.mcqs;
  if (state.currentMcqFilter !== 'all') {
    filtered = topic.mcqs.filter(m => m.t === state.currentMcqFilter);
  }
  if (state.currentMcqIndex < filtered.length - 1) {
    state.currentMcqIndex++;
    renderTopic(topic);
  }
}

function prevMcq(topicId) {
  if (state.currentMcqIndex > 0) {
    state.currentMcqIndex--;
    const topic = getTopic(topicId);
    if (topic) renderTopic(topic);
  }
}

function filterMcq(topicId, filter) {
  state.currentMcqFilter = filter;
  state.currentMcqIndex = 0;
  const topic = getTopic(topicId);
  if (topic) renderTopic(topic);
}

function resetMcqProgress(topicId) {
  if (!confirm('Reset all MCQ progress for this topic? This cannot be undone.')) return;
  var p = getTopicProgress(topicId);
  p.mcq = 0;
  p.totalMcq = 0;
  state.currentMcqResults = [];
  state.currentMcqIndex = 0;
  state.mcqCorrectTotal = 0;
  state.mcqWrongTotal = 0;
  saveProgress();
  updateSidebarProgress();
  const topic = getTopic(topicId);
  if (topic) renderTopic(topic);
  showToast('MCQ progress reset!', 'info');
}

function updateMcqScoreBadge() {
  var badge = document.querySelector('.mcq-score-badge');
  if (!badge) return;
  var totalAttempted = state.mcqCorrectTotal + state.mcqWrongTotal;
  var scorePct = totalAttempted ? Math.round(state.mcqCorrectTotal / totalAttempted * 100) : 0;
  var grade, gradeColor;
  if (scorePct >= 90) { grade = 'A+'; gradeColor = 'var(--color-success)'; }
  else if (scorePct >= 80) { grade = 'A'; gradeColor = 'var(--color-success)'; }
  else if (scorePct >= 70) { grade = 'B'; gradeColor = '#3B82F6'; }
  else if (scorePct >= 60) { grade = 'C'; gradeColor = '#F59E0B'; }
  else if (scorePct >= 40) { grade = 'D'; gradeColor = '#EF4444'; }
  else { grade = 'F'; gradeColor = 'var(--color-error)'; }
  badge.innerHTML = '<span>Correct: ' + state.mcqCorrectTotal + '</span><span>Wrong: ' + state.mcqWrongTotal + '</span><span class="mcq-grade" style="color:' + gradeColor + ';font-weight:700;">' + grade + '</span>';
}

function toggleSidebar() {
  state.sidebarOpen = !state.sidebarOpen;
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  updateHamburger();
  toggleOverlay(state.sidebarOpen);
}

function closeSidebar() {
  if (!state.sidebarOpen) return;
  state.sidebarOpen = false;
  document.getElementById('sidebar').classList.remove('open');
  updateHamburger();
  toggleOverlay(false);
}

function updateHamburger() {
  document.getElementById('hamburger').innerHTML = state.sidebarOpen ? '&#10005;' : '&#9776;';
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.textContent = state.sidebarOpen ? 'Close' : 'Menu';
  }
}

function toggleOverlay(show) {
  let overlay = document.getElementById('sidebar-overlay');
  if (show && window.innerWidth <= 1024) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sidebar-overlay';
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', closeSidebar);
    }
    overlay.classList.add('active');
  } else if (overlay) {
    overlay.classList.remove('active');
  }
}

function toggleTheme() {
  state.darkMode = !state.darkMode;
  localStorage.setItem('aptitudeDarkMode', state.darkMode);
  applyTheme();
}

let toastTimeout;

function showToast(message, type) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type||'info');
  toast.textContent = message;
  container.appendChild(toast);

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function bindEvents() {
  document.getElementById('hamburger').addEventListener('click', toggleSidebar);
  var menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
  var closeBtn = document.getElementById('sidebar-close');
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  var backButton = document.getElementById('back-button');
  if (backButton) backButton.addEventListener('click', () => history.back());

  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const view = el.dataset.view;
      if (view === 'dashboard') navigate('dashboard');
      else if (view === 'roadmap') navigate('roadmap');
      else if (view === 'verbal') {
        const verbalTopics = TOPICS_INDEX.topics.filter(t => t.category === 'verbal');
        if (verbalTopics.length) {
          navigate('topic', verbalTopics[0].id);
          state.currentSection = 'learn';
        }
      }
      else if (view === 'learn' || view === 'practice' || view === 'mcq') {
        if (state.currentTopicId) {
          const sectionMap = {learn:'learn', practice:'practice', mcq:'mcq'};
          state.currentSection = sectionMap[view] || 'learn';
          const topic = getTopic(state.currentTopicId);
          if (topic) renderTopic(topic);
        } else {
          if (TOPICS_INDEX.topics.length) {
            navigate('topic', TOPICS_INDEX.topics[0].id);
            state.currentSection = view === 'learn' ? 'learn' : view === 'practice' ? 'practice' : 'mcq';
          }
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
  });

  window.addEventListener('popstate', (event) => {
    const route = event.state;
    if (!route) return;
    state.restoringHistory = true;
    state.currentSection = route.section || 'learn';
    state.currentPracticeFormulaId = route.practiceFormulaId || null;
    state.currentPracticeIndex = route.practiceIndex || 0;
    state.currentMcqIndex = route.mcqIndex || 0;
    state.currentMcqFilter = route.mcqFilter || 'all';
    state.currentStepIndex = route.stepIndex || 0;
    if (route.view === 'topic' && route.topicId) loadTopic(route.topicId, false);
    else if (route.view === 'roadmap') renderRoadmap();
    else renderDashboard();
    state.restoringHistory = false;
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      document.getElementById('sidebar').classList.add('open');
      state.sidebarOpen = true;
      updateHamburger();
      toggleOverlay(false);
    }
  });
}

window.APP = {
  navigate,
  switchSection,
  toggleStep,
  markSectionRead,
  nextStep,
  prevStep,
  toggleSolution,
  markPracticeDone,
  nextPractice,
  prevPractice,
  checkMcqAnswer,
  nextMcq,
  prevMcq,
  filterMcq,
  resetMcqProgress,
  toggleSidebar,
  toggleTheme,
  selectPracticeFormula,
  backToFormulaList
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();
