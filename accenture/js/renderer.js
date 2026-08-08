/* ArenaRenderer — advanced content renderer for the Accenture dashboard.
 * Guarantees: mathematics and plain English mix safely in the same paragraph.
 * Math is extracted FIRST (protected from markdown mangling), rendered last
 * with KaTeX inline (baseline-correct) or display mode. */
(function (global) {
  'use strict';

  var M = '\u0000M', C = '\u0001C';

  /* ---------- math extraction: $...$ inline, $$...$$ display ---------- */

  /* Scan text into segments: {kind:'text', str} | {kind:'math', display, tex} */
  function scanMath(text) {
    var segs = [];
    var buf = '';
    var i = 0, n = text.length;

    function pushText(s) {
      if (s) segs.push({ kind: 'text', str: s });
    }

    while (i < n) {
      var c = text[i];
      if (c === '\\' && i + 1 < n) { buf += c + text[i + 1]; i += 2; continue; } // escapes (incl. \$)
      if (c !== '$') { buf += c; i++; continue; }

      var next = i + 1 < n ? text[i + 1] : '';
      var prev = i > 0 ? text[i - 1] : '';

      if (next === '$') { // display math
        var closeD = text.indexOf('$$', i + 2);
        if (closeD !== -1) {
          var texD = text.slice(i + 2, closeD);
          if (texD.trim()) {
            pushText(buf); buf = '';
            segs.push({ kind: 'math', display: true, tex: texD });
            i = closeD + 2;
            continue;
          }
        }
        buf += '$$'; i += 2; continue;
      }

      var isCurrency = /\d/.test(prev) && /\d/.test(next);   // $5.00
      var followedBySpace = /\s/.test(next) || next === '';
      if (!isCurrency && !followedBySpace) {
        var close = -1, j;
        for (j = i + 1; j < n; j++) {
          if (text[j] !== '$') continue;
          var jPrev = text[j - 1], jNext = j + 1 < n ? text[j + 1] : '';
          if (/\s/.test(jPrev)) continue;         // never a closer
          if (/\d/.test(jNext)) continue;         // currency-ish, skip
          close = j;
          break;
        }
        if (close !== -1) {
          var tex = text.slice(i + 1, close);
          if (tex && tex.indexOf('$') === -1) {
            pushText(buf); buf = '';
            segs.push({ kind: 'math', display: false, tex: tex });
            i = close + 1;
            continue;
          }
        }
      }
      buf += c;
      i++;
    }
    pushText(buf);
    return segs;
  }

  /* Replace math spans with placeholders: {text, parts} — for inline contexts. */
  function extractMath(text) {
    var parts = [];
    var out = '';
    scanMath(text).forEach(function (s) {
      if (s.kind === 'text') { out += s.str; return; }
      parts.push({ display: s.display, tex: s.tex });
      out += M + (parts.length - 1) + M;
    });
    return { text: out, parts: parts };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function tex(texStr, display) {
    if (!global.katex) {
      return '<code class="tex-fallback"' + (display ? ' style="display:block"' : '') + '>' + escapeHtml(texStr) + '</code>';
    }
    try {
      return global.katex.renderToString(texStr, {
        displayMode: !!display,
        throwOnError: false,
        strict: false,
        errorColor: '#f43f5e',
        output: 'htmlAndMathml'
      });
    } catch (e) {
      return '<code class="tex-fallback"' + (display ? ' style="display:block"' : '') + '>' + escapeHtml(texStr) + '</code>';
    }
  }

  function restoreMath(html, parts) {
    if (!parts.length) return html;
    return html.replace(new RegExp(M + '(\\d+)' + M, 'g'), function (_, idx) {
      var p = parts[+idx];
      return p.display
        ? '<span class="tex-display" role="math" aria-label="' + escapeHtml(p.tex) + '">' + tex(p.tex, true) + '</span>'
        : '<span class="tex-inline" role="math" aria-label="' + escapeHtml(p.tex) + '">' + tex(p.tex, false) + '</span>';
    });
  }

  /* ---------- markdown-lite on plain (math-protected) text ---------- */

  function mdInline(s) {
    var codeSpans = [];
    s = s.replace(/`([^`]+)`/g, function (_, code) {
      codeSpans.push(code);
      return C + (codeSpans.length - 1) + C;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    s = s.replace(new RegExp(C + '(\\d+)' + C, 'g'), function (_, idx) {
      return '<code>' + escapeHtml(codeSpans[+idx]) + '</code>';
    });
    return s;
  }

  /* Full inline pipeline: math-safe rich text with markdown. */
  function rich(text) {
    if (text == null) return '';
    var ex = extractMath(text);
    var html = escapeHtml(ex.text);
    html = mdInline(html);
    return restoreMath(html, ex.parts);
  }

  /* Paragraph pipeline — textbook layout: display math ($$...$$) is hoisted out
   * of the sentence onto its own line; inline math stays mid-sentence. */
  function richPara(text) {
    if (text == null) return '';
    var segs = scanMath(text);
    var chunks = [];
    var parts = [];
    var buf = '';
    segs.forEach(function (s) {
      if (s.kind === 'text') { buf += s.str; return; }
      if (s.display) {
        if (buf) { chunks.push({ text: buf }); buf = ''; }
        chunks.push({ display: s.tex });
        return;
      }
      parts.push({ display: false, tex: s.tex });
      buf += M + (parts.length - 1) + M;
    });
    if (buf) chunks.push({ text: buf });
    var h = '';
    chunks.forEach(function (c) {
      if (c.display) {
        h += '<div class="tex-display" role="math" aria-label="' + escapeHtml(c.display) + '">' + tex(c.display, true) + '</div>';
        return;
      }
      h += '<p>' + restoreMath(mdInline(escapeHtml(c.text)), parts) + '</p>';
    });
    return h;
  }

  /* ---------- icons (inline SVG, zero deps) ---------- */

  var ICONS = {
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7V5H6l6 7-6 7h12v-2"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    bomb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3v4M3 21 17 7M16.5 7.5l2-2M9.5 3.5 11 5M5.5 9.5 7 11"/><circle cx="7" cy="17" r="4.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    q: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10a3 3 0 1 1 5 2.8c-1.2.8-2 1.4-2 2.7M12 19h.01"/><circle cx="12" cy="12" r="10"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/></svg>'
  };
  function icon(name, cls) {
    return '<span class="svg-ico' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + (ICONS[name] || ICONS.info) + '</span>';
  }

  /* ---------- block renderers ---------- */

  function renderAnswer(ans) {
    if (ans == null) return '';
    if (typeof ans === 'string') return rich(ans);
    if (ans.latex) return '<div class="answer-tex">' + tex(ans.latex, true) + '</div>' + (ans.text ? '<p>' + rich(ans.text) + '</p>' : '');
    if (ans.text) return '<p>' + rich(ans.text) + '</p>';
    return '';
  }

  function formulaCard(b) {
    var h = '<article class="formula-card">';
    h += '<header class="fc-head">' + icon('sigma') + '<h4>' + escapeHtml(b.title || 'Formula') + '</h4></header>';
    h += '<div class="formula-tex">' + tex(b.latex, true) + '</div>';
    if (b.text) h += '<p class="formula-text">' + rich(b.text) + '</p>';
    if (b.whenToUse) h += '<div class="formula-when"><span class="mini-label">When to use</span><p>' + rich(b.whenToUse) + '</p></div>';
    if (b.explanation && b.explanation.length) {
      h += '<div class="formula-expl"><span class="mini-label">Why it works</span><ul>';
      b.explanation.forEach(function (e) { h += '<li>' + rich(e) + '</li>'; });
      h += '</ul></div>';
    }
    if (b.example) {
      var ex = b.example;
      h += '<div class="formula-example"><span class="mini-label">Example</span>';
      if (ex.prompt) h += '<p class="ex-prompt">' + rich(ex.prompt) + '</p>';
      if (ex.steps && ex.steps.length) h += stepsList(ex.steps);
      if (ex.answer != null) h += '<div class="answer-box"><span class="mini-label">Answer</span>' + renderAnswer(ex.answer) + '</div>';
      h += '</div>';
    }
    var foot = '';
    if (b.memoryTip) foot += '<div class="fc-foot tip"><span class="mini-label">' + icon('bulb') + ' Memory tip</span><p>' + rich(b.memoryTip) + '</p></div>';
    if (b.commonMistake) foot += '<div class="fc-foot risk"><span class="mini-label">' + icon('warn') + ' Common mistake</span><p>' + rich(b.commonMistake) + '</p></div>';
    if (foot) h += '<footer class="fc-footers">' + foot + '</footer>';
    h += '</article>';
    return h;
  }

  function stepsList(steps) {
    var h = '<ol class="steps-list">';
    steps.forEach(function (s, i) {
      h += '<li class="step"><span class="step-num">' + (i + 1) + '</span><div class="step-body"><p>' + rich(s.text) + '</p>' +
        (s.reason ? '<p class="step-reason">' + icon('info', 'tiny') + '<span>' + rich(s.reason) + '</span></p>' : '') +
        '</div></li>';
    });
    h += '</ol>';
    return h;
  }

  function solutionCard(b) {
    var h = '<section class="solution-card">';
    h += '<header class="sc-head">' + icon('q') + '<h4>Solution</h4></header>';
    if (b.prompt) h += '<div class="solution-prompt"><span class="mini-label">Question</span><p>' + rich(b.prompt) + '</p></div>';
    if (b.reasoning && b.reasoning.length) {
      h += '<div class="solution-reasoning"><span class="mini-label">Reasoning</span><ul>';
      b.reasoning.forEach(function (r) { h += '<li>' + rich(r) + '</li>'; });
      h += '</ul></div>';
    }
    if (b.steps && b.steps.length) {
      h += '<div class="solution-steps"><span class="mini-label">Step by step</span>' + stepsList(b.steps) + '</div>';
    }
    if (b.answer != null) h += '<div class="answer-box final"><span class="mini-label">Answer</span>' + renderAnswer(b.answer) + '</div>';
    h += '</section>';
    return h;
  }

  function calloutBlock(b) {
    var kind = ['tip', 'warning', 'remember', 'danger'].indexOf(b.kind) !== -1 ? b.kind : 'tip';
    var ic = kind === 'danger' ? 'bomb' : kind === 'warning' ? 'warn' : kind === 'remember' ? 'bulb' : 'info';
    var h = '<aside class="callout callout-' + kind + '">';
    h += '<div class="co-head">' + icon(ic) + '<strong>' + escapeHtml(b.title || kind) + '</strong></div>';
    h += '<div class="co-body">';
    (b.content || []).forEach(function (p) { h += '<p>' + rich(p) + '</p>'; });
    h += '</div></aside>';
    return h;
  }

  function tableBlock(b) {
    var h = '<div class="table-wrap"><table>';
    if (b.headers) {
      h += '<thead><tr>';
      b.headers.forEach(function (c) { h += '<th>' + rich(c) + '</th>'; });
      h += '</tr></thead>';
    }
    h += '<tbody>';
    (b.rows || []).forEach(function (row) {
      h += '<tr>';
      row.forEach(function (c) { h += '<td>' + rich(c) + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    return h;
  }

  function stepsBlock(b) {
    var h = '<div class="steps-block">';
    if (b.title) h += '<h4>' + escapeHtml(b.title) + '</h4>';
    h += stepsList(b.steps);
    h += '</div>';
    return h;
  }

  /* Derivation — textbook style: each step of a computation on its own line,
   * aligned, with an optional plain-English note beside it. */
  function derivationBlock(b) {
    var h = '<div class="derivation">';
    if (b.title) h += '<h4 class="derivation-title">' + escapeHtml(b.title) + '</h4>';
    (b.lines || []).forEach(function (ln) {
      if (typeof ln === 'string') ln = { latex: ln };
      var n = ln.note ? '<span class="derivation-note">' + rich(ln.note) + '</span>' : '';
      h += '<div class="derivation-line"><span class="derivation-tex" role="math" aria-label="' + escapeHtml(ln.latex) + '">' +
        tex(ln.latex, true) + '</span>' + n + '</div>';
    });
    h += '</div>';
    return h;
  }

  function pseudoBlock(b) {
    var r = global.PseudoLSP.render(b.code, { lineHighlights: b.lineHighlights });
    var h = '<div class="code-block" data-lang="pseudocode">';
    h += '<header class="cb-head"><span class="cb-lang">pseudocode</span><span class="cb-meta">' + r.lineCount + ' lines</span>' +
      '<span class="cb-right">' + r.issues +
      '<button class="copy-btn" data-action="copy" title="Copy code">' + icon('copy') + '<span class="copy-label">Copy</span></button></span></header>';
    h += r.html;
    h += r.problems;
    h += '</div>';
    return h;
  }

  function codeBlock(b) {
    var lang = b.language || 'text';
    var code = escapeHtml(b.code);
    var highlighted = code;
    if (global.Prism && Prism.languages[lang]) {
      highlighted = Prism.highlight(b.code, Prism.languages[lang], lang);
    }
    var h = '<div class="code-block" data-lang="' + escapeHtml(lang) + '">';
    h += '<header class="cb-head"><span class="cb-lang">' + escapeHtml(lang) + '</span><span class="cb-meta">' + b.code.split('\n').length + ' lines</span>' +
      '<span class="cb-right"><button class="copy-btn" data-action="copy" title="Copy code">' + icon('copy') + '<span class="copy-label">Copy</span></button></span></header>';
    h += '<pre class="prism-body" data-lang="' + escapeHtml(lang) + '"><code class="language-' + escapeHtml(lang) + '">' + highlighted + '</code></pre>';
    if (b.explanation && b.explanation.length) {
      h += '<div class="code-explanation"><span class="mini-label">Explanation</span><ul>';
      b.explanation.forEach(function (e) { h += '<li>' + rich(e) + '</li>'; });
      h += '</ul></div>';
    }
    h += '</div>';
    return h;
  }

  /* ---------- public API ---------- */

  global.ArenaRenderer = {
    VERSION: '1.1.0',
    rich: rich,
    richPara: richPara,
    tex: tex,
    icon: icon,
    renderBlock: function (b) {
      switch (b.type) {
        case 'p': return richPara(b.text);
        case 'formula': return formulaCard(b);
        case 'solution': return solutionCard(b);
        case 'callout': return calloutBlock(b);
        case 'table': return tableBlock(b);
        case 'steps': return stepsBlock(b);
        case 'derivation': return derivationBlock(b);
        case 'pseudocode': return pseudoBlock(b);
        case 'code': return codeBlock(b);
        default: return '';
      }
    }
  };
})(window);
