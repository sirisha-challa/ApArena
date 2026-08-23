/**
 * prose.js — Lightweight inline & block markdown renderer for ApArena
 *
 * Inspired by the architecture of markdown-it (token-stream, state, rules),
 * but tuned for the needs of placement-aptitude content where math (KaTeX),
 * short code snippets, emphasis, links, and lists are the dominant patterns.
 *
 * Processing pipeline (block → inline):
 *   raw text
 *     → extractFencedBlocks (```…```)
 *     → splitBlocks (paragraphs, lists, blockquotes, headings)
 *       → renderBlock   (block-level HTML wrapper)
 *         → renderInline (inline markdown + math + entities)
 *           → escapeHtml (safe text)
 */

(function () {
  'use strict';

  /* ── helpers ─────────────────────────────────────────── */

  function escapeHtml (str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function stripEmoji (value) {
    return String(value == null ? '' : value)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2300}-\u{23FF}\u{2600}-\u{27BF}\u200D]/gu, '')
      .replace(/[\uFE0F\uFE0E]/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
  }

  function stripReferences (value) {
    return String(value == null ? '' : value).replace(/\[reference:\d+\]/gi, '');
  }

  // --- Math isolation: extract $...$ and $$...$$ before cleaning, restore after
  var MATH_PLACEHOLDER = '\u0000MATH\u0000';
  function extractMathPlaceholders (str) {
    var placeholders = [];
    var out = '';
    var i=0, n=str.length;
    while(i<n){
      if(str.slice(i,i+2)==='$$'){
        var end=str.indexOf('$$',i+2);
        if(end!==-1){ placeholders.push(str.slice(i,end+2)); out+= MATH_PLACEHOLDER+(placeholders.length-1)+MATH_PLACEHOLDER; i=end+2; continue; }
      }
      if(str[i]==='$'){
        // avoid escaped \$ and currency
        if(i>0 && str[i-1]==='\\'){ out+=str[i]; i++; continue; }
        var j=str.indexOf('$',i+1);
        if(j!==-1 && j!==i+1){
          // avoid $$ case already handled, and single $ with no newline
          var inner=str.slice(i+1,j);
          if(inner.trim() && !inner.includes('\n') && !inner.includes('$$')){
            placeholders.push(str.slice(i,j+1)); out+= MATH_PLACEHOLDER+(placeholders.length-1)+MATH_PLACEHOLDER; i=j+1; continue;
          }
        }
      }
      out+=str[i]; i++;
    }
    return {text:out, placeholders:placeholders};
  }
  function restoreMathPlaceholders (str, placeholders){
    return str.replace(new RegExp(MATH_PLACEHOLDER+'(\\d+)'+MATH_PLACEHOLDER,'g'), function(_,idx){ return placeholders[+idx]; });
  }
  function normalizePunctuationSpacing (str){
    // ensure space after comma/semicolon/colon when followed by alphanum, but not inside math (already placeholdered)
    // fix missing space after , . ; : when next char is letter/digit and not already space
    str = str.replace(/,([A-Za-z0-9])/g, ', $1');
    str = str.replace(/;([A-Za-z0-9])/g, '; $1');
    str = str.replace(/:([A-Za-z0-9])/g, ': $1');
    // for period: avoid decimal numbers like 3.14, and abbreviations like e.g., but ensure sentence period followed by capital
    str = str.replace(/\.([A-Z])/g, '. $1');
    // ensure double spaces collapsed but preserve paragraph breaks (\n\n)
    return str;
  }
  function cleanText (value) {
    if(value==null) return '';
    var raw = String(value);
    var math = extractMathPlaceholders(raw);
    var t = math.text;
    // preserve paragraph breaks: protect \n\n
    t = t.replace(/\r\n/g,'\n');
    t = t.replace(/\n{2,}/g, '\u0001PARA\u0001');
    t = stripEmoji(stripReferences(t));
    t = t.replace(/\u0001PARA\u0001/g, '\n\n');
    t = normalizePunctuationSpacing(t);
    // preserve leading indentation for code lines — only collapse mid-line double spaces
    t = t.split('\n').map(function(line){
      var m=line.match(/^(\s*)(.*)$/);
      var indent=m[1], rest=m[2].replace(/[ \t]{2,}/g,' ');
      return indent+rest;
    }).join('\n');
    // restore math untouched
    t = restoreMathPlaceholders(t, math.placeholders);
    return t.trim();
  }

  /* ── inline parser state machine ─────────────────────── */

  /**
   * Inline rule signatures:
   *   function (src, pos) → { nextPos, html } | null
   *
   * Rules are tried in order at the current position.
   */

  var inlineRules = [];

  // 1. Display math  $$...$$
  inlineRules.push(function mathDisplay (src, pos) {
    if (src.slice(pos, pos + 2) !== '$$') return null;
    var end = src.indexOf('$$', pos + 2);
    if (end === -1) return null;
    var content = src.slice(pos + 2, end);
    return {
      nextPos: end + 2,
      html: '$$' + content + '$$'   // keep raw for KaTeX
    };
  });

  // 2. Inline math  $...$   (must not be preceded by a backslash-escaped dollar)
  inlineRules.push(function mathInline (src, pos) {
    if (src[pos] !== '$') return null;
    // skip escaped \$
    if (pos > 0 && src[pos - 1] === '\\') return null;
    var end = src.indexOf('$', pos + 1);
    if (end === -1 || end === pos + 1) return null;             // empty or no close
    // if next char after $ is also $, it's display math, skip
    if (src[end + 1] === '$') return null;
    var content = src.slice(pos + 1, end);
    // content must not contain whitespace-only or newlines
    return {
      nextPos: end + 1,
      html: '$' + content + '$'
    };
  });

  // 3. Bold **text**  (must not have space after **)
  inlineRules.push(function bold (src, pos) {
    if (src.slice(pos, pos + 2) !== '**') return null;
    var end = src.indexOf('**', pos + 2);
    if (end === -1 || end === pos + 2) return null;
    var content = src.slice(pos + 2, end);
    if (content.length === 0) return null;
    return {
      nextPos: end + 2,
      html: '<strong>' + renderInline(content) + '</strong>'
    };
  });

  // 4. Italic *text*  (single asterisk, not **)
  inlineRules.push(function italic (src, pos) {
    if (src[pos] !== '*') return null;
    if (src[pos + 1] === '*') return null;   // ** is bold
    var end = src.indexOf('*', pos + 1);
    if (end === -1 || end === pos + 1) return null;
    var content = src.slice(pos + 1, end);
    if (content.length === 0) return null;
    return {
      nextPos: end + 1,
      html: '<em>' + renderInline(content) + '</em>'
    };
  });

  // 5. Inline code  `code`
  inlineRules.push(function codeInline (src, pos) {
    if (src[pos] !== '`') return null;
    var end = src.indexOf('`', pos + 1);
    if (end === -1 || end === pos + 1) return null;
    var content = src.slice(pos + 1, end);
    return {
      nextPos: end + 1,
      html: '<code>' + escapeHtml(content) + '</code>'
    };
  });

  // 6. Markdown link [text](url)
  inlineRules.push(function link (src, pos) {
    if (src[pos] !== '[') return null;
    var closeBracket = src.indexOf(']', pos + 1);
    if (closeBracket === -1) return null;
    if (src[closeBracket + 1] !== '(') return null;
    var closeParen = src.indexOf(')', closeBracket + 2);
    if (closeParen === -1) return null;
    var text = src.slice(pos + 1, closeBracket);
    var url = src.slice(closeBracket + 2, closeParen).trim();
    if (!text || !url) return null;
    // sanitise url — only http, https, mailto
    var sanitised = url;
    var lower = url.toLowerCase();
    if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('mailto:')) {
      // ok
    } else if (lower.startsWith('//')) {
      sanitised = 'https:' + url;
    } else {
      sanitised = 'https://' + url;
    }
    return {
      nextPos: closeParen + 1,
      html: '<a href="' + escapeHtml(sanitised) + '" rel="noopener" target="_blank">' +
            renderInline(text) + '</a>'
    };
  });

  // 7. Auto-link bare URLs  (simple protocol-based)
  var AUTO_LINK_RE = /(^|[\s([>])https?:\/\/[^\s<>"']+[^\s<>"'.!,?;:)\]]/;
  inlineRules.push(function autoLink (src, pos) {
    var match = AUTO_LINK_RE.exec(src.slice(pos));
    if (!match) return null;
    var full = match[0];
    var prefix = match[1];
    var url = full.slice(prefix.length);
    // validate basic URL shape
    if (url.length < 5) return null;
    return {
      nextPos: pos + full.length,
      html: prefix + '<a href="' + escapeHtml(url) + '" rel="noopener" target="_blank">' +
            escapeHtml(url) + '</a>'
    };
  });

  /**
   * renderInline — parse inline markdown in a string, return HTML
   */
  function renderInline (text) {
    if (!text) return '';
    var src = String(text);
    var result = '';
    var pos = 0;
    var len = src.length;

    while (pos < len) {
      var matched = false;
      for (var ri = 0; ri < inlineRules.length; ri++) {
        var rule = inlineRules[ri];
        var out = rule(src, pos);
        if (out) {
          result += out.html;
          pos = out.nextPos;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      // plain character — escape and advance
      result += escapeHtml(src[pos]);
      pos++;
    }

    return result;
  }

  // --- pseudocode detection (for MCQs like "a=6\nb=4\nprint c")
  function looksLikePseudocodeLines (lines){
    if(!lines || lines.length<2) return false;
    var keywords = /^\s*(SET|DECLARE|WHILE|ENDWHILE|IF|ELSE|ELSE\s*IF|ENDIF|THEN|PRINT|FOR|ENDFOR|INPUT|OUTPUT|RETURN|FUNCTION|END\s*FUNCTION)\b/i;
    var assign = /^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+/;
    var hits=0;
    for(var i=0;i<lines.length;i++){
      var t=lines[i].trim();
      if(!t) continue;
      if(keywords.test(t) || assign.test(t) || /MOD|DIV/.test(t)) hits++;
    }
    // at least 2 hits or 60% of lines look like code
    return hits>=2 || (hits>=1 && lines.length>=2 && hits/lines.length>=0.5);
  }
  function looksLikePseudocodeText (text){
    if(!text || text.indexOf('\n')===-1) return false;
    return looksLikePseudocodeLines(text.split('\n'));
  }

  /* ── block-level parser ──────────────────────────────── */

  /**
   * Splits source into an array of block descriptors:
   *   { type: 'paragraph'|'ul'|'ol'|'blockquote'|'code'|'heading'|'hr', lines: [], meta? }
   */
  function splitBlocks (src) {
    var rawLines = src.split('\n');
    var blocks = [];
    var i = 0;
    var len = rawLines.length;

    while (i < len) {
      var line = rawLines[i];
      var trimmed = line.trim();

      // blank line → separator
      if (trimmed === '') {
        i++;
        continue;
      }

      // Fenced code block  ``` or ~~~
      if (/^```|^~{3,}/.test(line)) {
        var fence = line.match(/^(```+)/)[0];
        var info = line.slice(fence.length).trim();
        var codeLines = [];
        i++;
        while (i < len && !rawLines[i].startsWith(fence)) {
          codeLines.push(rawLines[i]);
          i++;
        }
        i++; // skip closing fence
        blocks.push({
          type: 'code',
          lang: info,
          content: codeLines.join('\n')
        });
        continue;
      }

      // Horizontal rule  --- or *** or ___
      if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(trimmed)) {
        blocks.push({ type: 'hr' });
        i++;
        continue;
      }

      // ATX heading  ##...
      var headingMatch = trimmed.match(/^(#{1,6})\s+(.+?)(?:\s+#+)?\s*$/);
      if (headingMatch) {
        blocks.push({
          type: 'heading',
          level: headingMatch[1].length,
          content: headingMatch[2]
        });
        i++;
        continue;
      }

      // Blockquote  >
      if (trimmed.startsWith('>')) {
        var quoteLines = [];
        while (i < len && rawLines[i].trim().startsWith('>')) {
          quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ''));
          i++;
        }
        blocks.push({ type: 'blockquote', lines: quoteLines });
        continue;
      }

      // Unordered list  - / * / +
      if (/^[-*+]\s/.test(trimmed)) {
        var ulItems = [];
        while (i < len && /^[-*+]\s/.test(rawLines[i].trim())) {
          ulItems.push(rawLines[i].trim().replace(/^[-*+]\s+?/, ''));
          i++;
        }
        blocks.push({ type: 'ul', items: ulItems });
        continue;
      }

      // Ordered list  1.  2.  etc.
      if (/^\d+\.\s/.test(trimmed)) {
        var olItems = [];
        while (i < len && /^\d+\.\s/.test(rawLines[i].trim())) {
          olItems.push(rawLines[i].trim().replace(/^\d+\.\s+?/, ''));
          i++;
        }
        blocks.push({ type: 'ol', items: olItems });
        continue;
      }

      // Table  | ... |
      if (trimmed.startsWith('|') && /\|\s*[-]+\s*\|/.test(rawLines[i + 1] || '')) {
        var tableRows = [];
        while (i < len && rawLines[i].trim().startsWith('|')) {
          tableRows.push(rawLines[i].trim());
          i++;
        }
        if (tableRows.length >= 2) {
          blocks.push({ type: 'table', rows: tableRows });
          continue;
        }
      }

      // Paragraph — gather consecutive non-blank lines until next block marker
      var paraLines = [];
      while (i < len && rawLines[i].trim() !== '') {
        // stop before block-level markers
        var cl = rawLines[i].trim();
        if (/^(```|~{3,}|#{1,6}\s|[-*+]{3,}\s*$|>{1,}\s|\|)/.test(cl)) break;
        paraLines.push(rawLines[i]);
        i++;
      }
      if (paraLines.length) {
        // ponytail: pseudocode lines like "a = 6\nb = 4\nprint c" should not become a congealed paragraph — render as code
        if(looksLikePseudocodeLines(paraLines)){
          blocks.push({ type: 'code', lang: 'pseudocode', content: paraLines.join('\n') });
        } else {
          blocks.push({ type: 'paragraph', lines: paraLines });
        }
      }
    }

    return blocks;
  }

  /**
    * Render a block descriptor to HTML — digital article feel: airy paragraphs, isolated math, derivation rhythm
    */
  function renderBlock (block) {
    switch (block.type) {
      case 'paragraph':
        // for digital article, break paragraph into sentences with breathing room if it's long (math-heavy derivations)
        // if paragraph contains '→' or '⇒' or multiple ' = ' with ';' we render as derivation steps
        var rawPara = block.lines.join(' ');
        // derivation heuristic: contains → or ⇒ or at least 2 ' = ' and ';' or line-break-like 'Step'
        if(/[→⇒]/.test(rawPara) || ( (rawPara.match(/\s=\s/g)||[]).length>=2 && /;/.test(rawPara) )){
          // split on → ⇒ ; and render each piece as a derivation line with new line + indent
          var parts = rawPara.split(/\s*[→⇒;]\s*/).filter(Boolean);
          if(parts.length>=2){
            return '<div class="derivation-block">' + parts.map(function(p,i){
              return '<div class="derivation-line"><span class="derivation-idx">'+(i+1)+'</span><span class="derivation-text">'+renderInline(p.trim())+'</span></div>';
            }).join('') + '</div>';
          }
        }
        return '<p class="prose-para">' + renderInline(rawPara) + '</p>';

      case 'heading':
        return '<h' + block.level + '>' + renderInline(block.content) + '</h' + block.level + '>';

      case 'blockquote':
        return '<blockquote>' +
          block.lines.map(function (l) { return renderInline(l); }).join('<br>') +
          '</blockquote>';

      case 'ul':
        return '<ul>' +
          block.items.map(function (item) {
            return '<li>' + renderInline(item) + '</li>';
          }).join('') +
          '</ul>';

      case 'ol':
        return '<ol>' +
          block.items.map(function (item) {
            return '<li>' + renderInline(item) + '</li>';
          }).join('') +
          '</ol>';

      case 'code':
        var lang = (block.lang||'').toLowerCase();
        var isPseudo = lang==='pseudocode' || looksLikePseudocodeText(block.content);
        if(isPseudo){
          // preserve indentation, add line numbers, keep math placeholders outside code? code should not be math-rendered
          var lines = block.content.split('\n');
          var html = '<div class="pseudocode-block"><div class="pseudocode-head"><span class="pseudocode-label">pseudocode</span><span class="pseudocode-lines">'+lines.length+' lines</span></div><pre class="pseudocode-pre"><code>';
          for(var li=0; li<lines.length; li++){
            var line=lines[li];
            // keep leading spaces as &nbsp; for visual indent, but preserve for copy
            var indent = line.match(/^\s*/)[0].length;
            var pad = '';
            for(var s=0;s<indent;s++) pad+=' ';
            html += '<span class="pseudocode-line"><span class="ln">'+(li+1)+'</span><span class="code-text">'+escapeHtml(line)+'</span></span>\n';
          }
          html += '</code></pre></div>';
          return html;
        }
        var langClass = block.lang ? ' class="code-lang-' + escapeHtml(block.lang) + '"' : '';
        return '<pre' + langClass + '><code>' + escapeHtml(block.content) + '</code></pre>';

      case 'hr':
        return '<hr>';

      case 'table':
        return renderTable(block.rows);

      default:
        return '';
    }
  }

  /**
   * Render a GFM pipe table from raw rows
   *   rows[0] = header row   e.g. "| A | B |"
   *   rows[1] = separator   e.g. "|---|---|"
   *   rows[2+] = data rows
   */
  function renderTable (rows) {
    function splitRow (row) {
      return row.split('|').slice(1, -1).map(function (c) { return c.trim(); });
    }

    var headerCells = splitRow(rows[0]);
    var dataRows = [];
    for (var ri = 2; ri < rows.length; ri++) {
      var cells = splitRow(rows[ri]);
      if (cells.length) dataRows.push(cells);
    }

    var html = '<div class="table-wrapper"><table>';
    // header
    html += '<thead><tr>';
    for (var hi = 0; hi < headerCells.length; hi++) {
      html += '<th>' + renderInline(headerCells[hi]) + '</th>';
    }
    html += '</tr></thead>';
    // body
    html += '<tbody>';
    for (var di = 0; di < dataRows.length; di++) {
      html += '<tr>';
      for (var ci = 0; ci < dataRows[di].length; ci++) {
        html += '<td>' + renderInline(dataRows[di][ci]) + '</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table></div>';
    return html;
  }

  /**
   * renderProse — full block + inline rendering
   *
   * Accepts a string or array of strings.
   */
  function renderProse (text) {
    if (text == null) return '';
    if (Array.isArray(text)) {
      return text.filter(Boolean).map(function (t) { return renderProse(t); }).join('\n');
    }
    var src = cleanText(String(text));
    if (!src) return '';
    var blocks = splitBlocks(src);
    return blocks.map(renderBlock).join('\n');
  }

  /**
   * formatInline — just inline rendering (for use inside existing containers)
   */
  function formatInline (text) {
    if (text == null) return '';
    if (Array.isArray(text)) {
      return text.filter(Boolean).map(function (t) { return formatInline(t); }).join('<br>');
    }
    return renderInline(cleanText(String(text)));
  }

  /**
   * formatSteps — enhanced version that still uses the old container classes
   * but applies inline markdown within each step.
   */
  function formatSteps (text, asWhiteboard) {
    if (text === null || text === undefined) return '';
    if (Array.isArray(text)) {
      return asWhiteboard
        ? renderNumberedSteps(text)
        : text.filter(Boolean).map(function (para) {
            // ponytail: if array item looks like pseudocode line, render as code block not paragraph
            if(para && para.indexOf('\n')!==-1 && looksLikePseudocodeText(para)){
              return renderProse('```pseudocode\n'+para+'\n```');
            }
            return '<p class="prose-para">' + formatInline(para) + '</p>';
          }).join('');
    }
    var rawOrig = String(text);
    // early pseudocode bypass: only for short pure pseudocode (MCQ), not for reading sections that mix code + prose
    // require: no long explanatory sentence (>100 chars) and total length <400 and at least 2 code lines
    var isPurePseudo = looksLikePseudocodeText(rawOrig) && rawOrig.length < 500 && !/[A-Z][a-z]{2,}\s+[a-z]{3,}\s+[a-z]{3,}/.test(rawOrig.slice(rawOrig.indexOf('\n\n')+2 || 0));
    // also check that no line is a long prose sentence (>90 chars)
    if(isPurePseudo){
      var lines = rawOrig.split('\n').filter(function(l){return l.trim();});
      var longLines = lines.filter(function(l){return l.length>90;});
      if(longLines.length===0){
        return renderProse('```pseudocode\n'+rawOrig+'\n```');
      }
    }
    var raw = cleanText(rawOrig);
    if (!raw) return '';

    var stepPattern = /(?:^|\s)(?:step\s*(\d+)\s*(?:\([^)]*\))?|\(?\s*(\d+)\s*\))\s*[:.\-]\s*/gi;
    // collect matches manually for compatibility
    var matches = [];
    var m;
    while ((m = stepPattern.exec(raw)) !== null) { matches.push(m); }
    if (!matches.length) {
      if (asWhiteboard) return renderNumberedSteps(splitWhiteboardLines(raw));
      return renderProse(raw);
    }

    var html = '<div class="solution-steps">';
    var preamble = raw.slice(0, matches[0].index).trim();
    if (preamble) html += '<p class="solution-intro">' + formatInline(preamble) + '</p>';

    matches.forEach(function (match, index) {
      var start = match.index + match[0].length;
      var end = index + 1 < matches.length ? matches[index + 1].index : raw.length;
      var content = raw.slice(start, end).trim();
      html += '<div class="solution-step"><p>' + formatInline(content) + '</p></div>';
    });
    return html + '</div>';
  }

  /**
   * renderNumberedSteps — render an array of strings as solution steps
   */
  function renderNumberedSteps (lines) {
    return '<div class="solution-steps">' +
      lines.filter(Boolean).map(function (line) {
        return '<div class="solution-step"><p>' + formatInline(line.trim()) + '</p></div>';
      }).join('') +
      '</div>';
  }

  /**
   * splitWhiteboardLines — heuristically split prose into sentence-sized chunks
   */
  function splitWhiteboardLines (text) {
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

  /* ── public API ──────────────────────────────────────── */

  window.Prose = {
    render:    renderProse,      // full block + inline
    inline:    formatInline,     // inline only (for existing containers)
    steps:     formatSteps,      // legacy-enhanced (step detection + inline)
    numbered:  renderNumberedSteps,
    clean:     cleanText,
    escape:    escapeHtml
  };

})();
