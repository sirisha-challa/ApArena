(function() {
'use strict';

const state = {
  currentView: 'dashboard',
  currentTopicId: null,
  currentSection: 'learn',
  currentReadingSection: null,
  currentMcqIndex: 0,
  currentMcqFilter: 'all',
  currentMcqResults: [],
  currentPracticeFormulaId: null,
  currentPracticeIndex: 0,
  currentFormulaIndex: 0,
  progress: JSON.parse(localStorage.getItem('aptitudeProgress')) || {},
  sidebarOpen: window.innerWidth > 1024,
  darkMode: localStorage.getItem('aptitudeDarkMode') === 'true'
};

function init() {
  applyTheme();
  document.getElementById('sidebar').classList.toggle('open', state.sidebarOpen);
  updateHamburger();
  renderSidebar();
  renderBottomNav();
  renderDashboard();
  bindEvents();
}

function renderMath() {
  const container = document.getElementById('app-content');
  if (!container || !window.renderMathInElement) return;
  renderMathInElement(container, {
    delimiters: [
      {left: '$$', right: '$$', display: true},
      {left: '$', right: '$', display: false}
    ]
  });
}

function setContent(html) {
  const container = document.getElementById('app-content');
  if (!container) return;
  container.innerHTML = html;
  renderMath();
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
  const topics = APP_DATA.topics;
  let total = 0, done = 0;
  topics.forEach(t => {
    const p = getTopicProgress(t.id);
    const practiceCount = Object.values(t.practiceProblems).reduce((sum, arr) => sum + arr.length, 0);
    total += (t.readingSections.length || 0) + (t.formulas.length || 0) + practiceCount + (t.mcqs.length || 0);
    done += Object.keys(p.sections).length + Object.keys(p.formulas).length + Object.keys(p.practice).length + (p.mcq || 0);
  });
  total = Math.max(total, 1);
  return Math.round(done / total * 100);
}

function getTopic(id) { return APP_DATA.topics.find(t => t.id === id); }

function renderSidebar() {
  const nav = document.getElementById('sidebar-nav');
  const categories = APP_DATA.categories || [];
  const topics = APP_DATA.topics;
  let html = '';

  if (categories.length) {
    categories.forEach(cat => {
      const catTopics = topics.filter(t => t.category === cat.id);
      if (!catTopics.length) return;
      html += `<div class="sidebar-section-label">${cat.title}</div>`;
      catTopics.forEach(t => {
        const p = getTopicProgress(t.id);
        const mcqDone = Math.min(p.mcq || 0, t.mcqs.length || 1);
        const mcqTotal = t.mcqs.length || 1;
        const pct = Math.round(mcqDone / mcqTotal * 100);
        html += `<button class="sidebar-item ${state.currentTopicId===t.id?'active':''}" data-topic="${t.id}" onclick="APP.navigate('topic','${t.id}')">
          <span class="sidebar-item-icon">${t.icon}</span>
          <span class="sidebar-item-text">${t.title}</span>
          <span class="sidebar-item-status" style="background:${pct>=100?'#10B981':pct>0?'#F59E0B':'#CBD5E1'}"></span>
        </button>`;
      });
    });
  } else {
    html += '<div class="sidebar-section-label">Topics</div>';
    topics.forEach(t => {
      const p = getTopicProgress(t.id);
      const mcqDone = Math.min(p.mcq || 0, t.mcqs.length || 1);
      const mcqTotal = t.mcqs.length || 1;
      const pct = Math.round(mcqDone / mcqTotal * 100);
      html += `<button class="sidebar-item ${state.currentTopicId===t.id?'active':''}" data-topic="${t.id}" onclick="APP.navigate('topic','${t.id}')">
        <span class="sidebar-item-icon">${t.icon}</span>
        <span class="sidebar-item-text">${t.title}</span>
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
  const topics = APP_DATA.topics;
  const categories = APP_DATA.categories || [];
  const completed = topics.filter(t => (getTopicProgress(t.id).mcq||0) >= t.mcqs.length).length;

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
        <h2 class="category-title" style="color:${cat.color}">${cat.icon} ${cat.title}</h2>
        <p class="text-muted category-subtitle">${cat.subtitle}</p>
        <div class="bento-grid">`;

      catTopics.forEach((t, ti) => {
        const p = getTopicProgress(t.id);
        const mcqPct = t.mcqs.length ? Math.round(Math.min(p.mcq||0, t.mcqs.length)/t.mcqs.length*100) : 0;
        const globalIdx = catIdx * 10 + ti;
        html += `
        <div class="topic-card glass bento-${(globalIdx%4)+1}" style="--topic-color:${t.color || cat.color}" onclick="APP.navigate('topic','${t.id}')">
          <div class="topic-card-header">
            <span class="topic-icon">${t.icon}</span>
            <span class="topic-days">${t.days}</span>
          </div>
          <h3 class="topic-title">${t.title}</h3>
          <div class="topic-subtopics">${t.subtopics.slice(0,3).join(' - ')}</div>
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
      const mcqPct = t.mcqs.length ? Math.round(Math.min(p.mcq||0, t.mcqs.length)/t.mcqs.length*100) : 0;
      html += `
      <div class="topic-card glass bento-${topics.indexOf(t)%4+1}" style="--topic-color:${t.color}" onclick="APP.navigate('topic','${t.id}')">
        <div class="topic-card-header">
          <span class="topic-icon">${t.icon}</span>
          <span class="topic-days">${t.days}</span>
        </div>
        <h3 class="topic-title">${t.title}</h3>
        <div class="topic-subtopics">${t.subtopics.slice(0,3).join(' - ')}</div>
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
}

function renderRoadmap() {
  state.currentView = 'roadmap';
  document.getElementById('header-title').textContent = 'Roadmap';
  const content = document.getElementById('app-content');
  const topics = APP_DATA.topics;
  const categories = APP_DATA.categories || [];

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
        <h2 class="month-title">${cat.icon} ${cat.title}</h2>
        <div class="roadmap">`;

      catTopics.forEach((t) => {
        const p = getTopicProgress(t.id);
        const mcqPct = t.mcqs.length ? Math.round(Math.min(p.mcq||0, t.mcqs.length)/t.mcqs.length*100) : 0;
        const status = mcqPct >= 100 ? 'completed' : mcqPct > 0 ? 'in-progress' : 'locked';
        html += `<div class="roadmap-item ${status}" onclick="APP.navigate('topic','${t.id}')">
          <div class="roadmap-dot"></div>
          <div class="roadmap-content">
            <div class="roadmap-header">
              <span class="roadmap-icon">${t.icon}</span>
              <span class="roadmap-days">Day ${t.days}</span>
              <span class="roadmap-status">${status === 'completed' ? 'DONE' : status === 'in-progress' ? '...' : 'LOCK'}</span>
            </div>
            <h3 class="roadmap-title">${t.title}</h3>
            <p class="roadmap-subtopics">${t.subtopics.join(' - ')}</p>
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
      const mcqPct = t.mcqs.length ? Math.round(Math.min(p.mcq||0, t.mcqs.length)/t.mcqs.length*100) : 0;
      const status = mcqPct >= 100 ? 'completed' : mcqPct > 0 ? 'in-progress' : 'locked';
      html += `<div class="roadmap-item ${status}" onclick="APP.navigate('topic','${t.id}')">
        <div class="roadmap-dot"></div>
        <div class="roadmap-content">
          <div class="roadmap-header">
            <span class="roadmap-icon">${t.icon}</span>
            <span class="roadmap-days">Day ${t.days}</span>
            <span class="roadmap-status">${status === 'completed' ? 'DONE' : status === 'in-progress' ? '...' : 'LOCK'}</span>
          </div>
          <h3 class="roadmap-title">${t.title}</h3>
          <p class="roadmap-subtopics">${t.subtopics.join(' - ')}</p>
          <div class="progress-bar"><div style="width:${mcqPct}%"></div></div>
        </div>
      </div>`;
    });
    html += `</div></div>`;
  }

  html += `</div></div>`;
  setContent(html);
  renderBottomNav();
}

function renderTopic(topicId) {
  const topic = getTopic(topicId);
  if (!topic) { renderDashboard(); return; }

  state.currentView = 'topic';
  state.currentTopicId = topicId;
  state.currentSection = state.currentSection || 'learn';
  document.getElementById('header-title').textContent = topic.icon + ' ' + topic.title;

  const content = document.getElementById('app-content');
  const p = getTopicProgress(topicId);
  const mcqPct = topic.mcqs.length ? Math.round(Math.min(p.mcq||0, topic.mcqs.length)/topic.mcqs.length*100) : 0;

  let html = `
  <div class="page-content">
    <div class="topic-header glass" style="--topic-color:${topic.color}">
      <div class="topic-header-info">
        <h1 class="text-2xl fw-700">${topic.icon} ${topic.title}</h1>
        <p class="text-muted">${topic.subtopics.join(' - ')}</p>
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

  html += renderSectionContent(topicId);
  html += `</div></div>`;
  setContent(html);
  renderSidebar();
  renderBottomNav();
}

function renderSectionContent(topicId) {
  const topic = getTopic(topicId);
  if (!topic) return '';

  switch(state.currentSection) {
    case 'learn': return renderLearn(topic);
    case 'formulas': return renderFormulas(topic);
    case 'practice': return renderPractice(topic);
    case 'mcq': return renderMcq(topic);
    default: return renderLearn(topic);
  }
}

function formatSteps(text) {
    if (text === null || text === undefined) return '';
    var raw = String(text).trim();
    if (!raw) return '';

    function highlightMath(content) {
        if (!content) return '';
        var segments = content.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
        return segments.map(function(seg) {
            if (/^\$\$[^$]+\$\$$/.test(seg)) {
                return '<span class="math-bold">' + seg + '</span>';
            }
            if (/^\$[^$]+\$$/.test(seg)) {
                return '<span class="math-bold">' + seg + '</span>';
            }
            return seg;
        }).join('');
    }

    var stepPattern = /Step\s*\d+\s*(?:\([^)]*\))?\s*[:\-\.]\s*/gi;
    var matches = [];
    var m;
    while ((m = stepPattern.exec(raw)) !== null) {
        matches.push({ index: m.index, length: m[0].length, label: m[0].trim() });
    }

    if (matches.length === 0) {
        var paragraphs = raw.split(/\n\n+/).filter(function(p) { return p.trim(); });
        if (paragraphs.length > 1) {
            return paragraphs.map(function(p) {
                return '<p class="prose-para">' + highlightMath(p.trim()) + '</p>';
            }).join('');
        }
        return '<p class="prose-para">' + highlightMath(raw) + '</p>';
    }

    var html = '<div class="step-list">';

    if (matches[0].index > 0) {
        var preamble = raw.slice(0, matches[0].index).trim();
        if (preamble) {
            html += '<div class="step-item"><span class="step-text">' + highlightMath(preamble) + '</span></div>';
        }
    }

    for (var i = 0; i < matches.length; i++) {
        var contentStart = matches[i].index + matches[i].length;
        var contentEnd = (i + 1 < matches.length) ? matches[i + 1].index : raw.length;
        var content = raw.slice(contentStart, contentEnd).trim();
        var label = matches[i].label.replace(/[:\-\.]\s*$/, '').trim();

        html += '<div class="step-item">';
        html += '<span class="step-label">' + label + '</span>';
        html += '<span class="step-text">' + highlightMath(content) + '</span>';
        html += '</div>';
    }

    html += '</div>';
    return html;
}

var renderSteps = formatSteps;

function renderLearn(topic) {
    let html = '<div class="reading-sections">';
    topic.readingSections.forEach((section, si) => {
        const p = getTopicProgress(topic.id);
        const read = p.sections[section.id] || false;
        const expanded = state.currentReadingSection === section.id;
        html += `
        <div class="reading-card glass ${read ? 'completed' : ''}" id="section-${section.id}">
            <div class="reading-header" onclick="APP.toggleSection('${topic.id}','${section.id}')">
                <h3 class="reading-title">${section.title}</h3>
                <span class="reading-toggle ${expanded ? 'expanded' : ''}">▼</span>
            </div>
            <div class="reading-body ${expanded ? 'expanded' : ''}">
                <div class="reading-intro">${formatSteps(section.content)}</div>
                <ul class="reading-bullets">
                    ${section.subsections.map(sub => `
                    <li>
                        <strong class="sub-title">${sub.title}</strong>
                        <div class="sub-body">${formatSteps(sub.content)}</div>
                    </li>
                    `).join('')}
                </ul>
                <button class="btn btn-primary btn-sm" onclick="APP.markSectionRead('${topic.id}','${section.id}')">
                    ${read ? '✓ DONE' : 'Mark as Read'}
                </button>
            </div>
        </div>`;
    });
    html += '</div>';
    return html;
}

function renderFormulas(topic) {
    let html = '<div class="formulas-grid">';
    topic.formulas.forEach((f, i) => {
        html += `
        <div class="formula-card glass">
            <div class="formula-number">#${i + 1}</div>
            <div class="formula-title">${f.title}</div>
            <div class="formula-box">$$${f.formula}$$</div>
            <div class="formula-explanation">${formatSteps(f.explanation)}</div>
            <div class="formula-example">
                <strong class="example-label">Example:</strong>
                <div class="example-content">${formatSteps(f.example)}</div>
            </div>
        </div>`;
    });
    html += '</div>';
    return html;
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
        <div class="formula-title">${f.title}</div>
        <div class="formula-box">$$${f.formula}$$</div>
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
    <div class="formula-title">${currentFormula.title}</div>
    <div class="formula-box">$$${currentFormula.formula}$$</div>
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
            <div class="step-item">
                <span class="step-label">Step ${i+1}</span>
                <span class="step-text">${formatSteps(step)}</span>
            </div>
            `).join('')}
        </div>
        <div class="practice-answer">
            <strong>Answer:</strong> ${problem.a}
        </div>
        <button class="btn btn-success btn-sm mt-2" onclick="APP.markPracticeDone('${topic.id}','${state.currentPracticeFormulaId}',${idx})">
            ✓ Mark as Done
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

  let html = `
  <div class="mcq-stats-bar">
    <span>Questions: ${filtered.length}</span>
    <span>Answered: ${p.mcq||0}</span>
    <span>Progress: ${Math.min(Math.round((p.mcq||0)/mcqs.length*100),100)}%</span>
  </div>
  <div class="mcq-nav">
    <button class="btn btn-outline" onclick="APP.prevMcq('${topic.id}')" ${idx===0?'disabled':''}>Prev</button>
    <span class="mcq-counter">${idx+1} / ${filtered.length}</span>
    <button class="btn btn-outline" onclick="APP.nextMcq('${topic.id}')" ${idx>=filtered.length-1?'disabled':''}>Next</button>
  </div>
  <div class="mcq-card glass" id="mcq-card">
    <div class="mcq-header">
      <span class="badge primary">Number System</span>
      <span class="mcq-number">Q${idx+1}</span>
    </div>
    <div class="mcq-question">${formatSteps(mcq.q)}</div>
    <div class="mcq-options" id="mcq-options">
      ${mcq.opts.map((opt, oi) => `
        <button class="mcq-option" data-index="${oi}" onclick="APP.checkMcqAnswer('${topic.id}', ${idx}, ${oi}, this)">
          <span class="option-letter">${String.fromCharCode(65+oi)}</span>
          <span class="option-text">${opt}</span>
        </button>
      `).join('')}
    </div>
    <div class="mcq-feedback" id="mcq-feedback" style="display:none">
      <div class="mcq-result" id="mcq-result"></div>
      <div class="mcq-explanation" id="mcq-explanation"></div>
      <button class="btn btn-primary mt-2" onclick="APP.nextMcq('${topic.id}')">Next Question</button>
    </div>
  </div>`;
  return html;
}

function navigate(view, param) {
  closeSidebar();
  if (view === 'dashboard') renderDashboard();
  else if (view === 'roadmap') renderRoadmap();
  else if (view === 'topic') renderTopic(param);
}

function switchSection(section) {
  state.currentSection = section;
  if (state.currentTopicId) {
    renderTopic(state.currentTopicId);
  }
}

function toggleSection(topicId, sectionId) {
  state.currentReadingSection = state.currentReadingSection === sectionId ? null : sectionId;
  renderTopic(topicId);
}

function markSectionRead(topicId, sectionId) {
  updateTopicProgress(topicId, 'sections', sectionId, true);
  state.currentReadingSection = null;
  renderTopic(topicId);
  showToast('Section marked as read!', 'success');
}

function selectPracticeFormula(topicId, formulaId) {
  state.currentPracticeFormulaId = formulaId;
  state.currentPracticeIndex = 0;
  renderTopic(topicId);
}

function backToFormulaList(topicId) {
  state.currentPracticeFormulaId = null;
  state.currentPracticeIndex = 0;
  renderTopic(topicId);
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
      renderTopic(state.currentTopicId);
    }
  }
}

function prevPractice() {
  if (state.currentPracticeIndex > 0) {
    state.currentPracticeIndex--;
    renderTopic(state.currentTopicId);
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
  }

  const feedback = document.getElementById('mcq-feedback');
  const result = document.getElementById('mcq-result');
  const explanation = document.getElementById('mcq-explanation');

  if (selected === mcq.c) {
    result.innerHTML = '<strong>Correct!</strong>';
    result.style.color = 'var(--color-success)';
  } else {
    result.innerHTML = '<strong>Wrong!</strong> Correct answer: ' + String.fromCharCode(65+mcq.c);
    result.style.color = 'var(--color-error)';
  }

  explanation.innerHTML = formatSteps(mcq.exp || 'No explanation available.');
  feedback.style.display = 'block';
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
    renderTopic(topicId);
  }
}

function prevMcq(topicId) {
  if (state.currentMcqIndex > 0) {
    state.currentMcqIndex--;
    renderTopic(topicId);
  }
}

function filterMcq(topicId, filter) {
  state.currentMcqFilter = filter;
  state.currentMcqIndex = 0;
  renderTopic(topicId);
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

  document.querySelectorAll('.bottom-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const view = el.dataset.view;
      if (view === 'dashboard') renderDashboard();
      else if (view === 'roadmap') renderRoadmap();
      else if (view === 'verbal') {
        const verbalTopics = APP_DATA.topics.filter(t => t.category === 'verbal');
        if (verbalTopics.length) {
          navigate('topic', verbalTopics[0].id);
          state.currentSection = 'learn';
        }
      }
      else if (view === 'learn' || view === 'practice' || view === 'mcq') {
        if (state.currentTopicId) {
          const sectionMap = {learn:'learn', practice:'practice', mcq:'mcq'};
          state.currentSection = sectionMap[view] || 'learn';
          renderTopic(state.currentTopicId);
        } else {
          if (APP_DATA.topics.length) {
            navigate('topic', APP_DATA.topics[0].id);
            state.currentSection = view === 'learn' ? 'learn' : view === 'practice' ? 'practice' : 'mcq';
          }
        }
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSidebar();
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
  toggleSection,
  markSectionRead,
  toggleSolution,
  markPracticeDone,
  nextPractice,
  prevPractice,
  checkMcqAnswer,
  nextMcq,
  prevMcq,
  filterMcq,
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
