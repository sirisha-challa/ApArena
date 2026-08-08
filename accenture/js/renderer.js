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
    var ex = extractMath(String(text).replace(/\[reference:\d+\]/gi, ''));
    var html = escapeHtml(ex.text);
    html = mdInline(html);
    return restoreMath(html, ex.parts);
  }

  /* Paragraph pipeline — textbook layout: display math ($$...$$) is hoisted out
   * of the sentence onto its own line; inline math stays mid-sentence. */
  function richPara(text) {
    if (text == null) return '';
    var segs = scanMath(String(text).replace(/\[reference:\d+\]/gi, ''));
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
    person: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>',
    puzzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15.39 4.39a1 1 0 0 0 1.68-.474 2.5 2.5 0 1 1 3.014 3.015 1 1 0 0 0-.474 1.68l1.683 1.682a2.414 2.414 0 0 1 0 3.414L19.61 15.39a1 1 0 0 1-1.68-.474 2.5 2.5 0 1 0-3.014 3.015 1 1 0 0 1 .474 1.68l-1.683 1.682a2.414 2.414 0 0 1-3.414 0L8.61 19.61a1 1 0 0 0-1.68.474 2.5 2.5 0 1 1-3.014-3.015 1 1 0 0 0 .474-1.68l-1.683-1.682a2.414 2.414 0 0 1 0-3.414L4.39 8.61a1 1 0 0 1 1.68.474 2.5 2.5 0 1 0 3.014-3.015 1 1 0 0 1-.474-1.68l1.683-1.682a2.414 2.414 0 0 1 3.414 0z" /></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" /></svg>',
    brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" /><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" /><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" /><path d="M17.599 6.5a3 3 0 0 0 .399-1.375" /><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" /><path d="M3.477 10.896a4 4 0 0 1 .585-.396" /><path d="M19.938 10.5a4 4 0 0 1 .585.396" /><path d="M6 18a4 4 0 0 1-1.967-.516" /><path d="M19.967 17.484A4 4 0 0 1 18 18" /></svg>',
    shape: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" /><rect x="3" y="14" width="7" height="7" rx="1" /><circle cx="17.5" cy="17.5" r="3.5" /></svg>',
    calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>',
    office: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" /><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" /><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" /><path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" /></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4" /><path d="m6 8-4 4 4 4" /><path d="m14.5 4-5 16" /></svg>',
    cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></svg>',
    chip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2" /><path d="M15 20v2" /><path d="M2 15h2" /><path d="M2 9h2" /><path d="M20 15h2" /><path d="M20 9h2" /><path d="M9 2v2" /><path d="M9 20v2" /></svg>',
    terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" /></svg>',
    mic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>',
    sigma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2" /></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" /><path d="M9 18h6" /><path d="M10 22h4" /></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>',
    bomb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="9" /><path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95" /><path d="m22 2-1.5 1.5" /></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>',
    q: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" /></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" /><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" /><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" /></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>',
    house: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>',
    arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>',
    clipboardCheck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></svg>',
    target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>',
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
    VERSION: '1.2.0',
    rich: rich,
    richPara: richPara,
    tex: tex,
    icon: icon,
    ICONS: ICONS,
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
