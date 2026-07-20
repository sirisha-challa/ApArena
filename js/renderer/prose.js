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
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function stripReferences (value) {
    return String(value == null ? '' : value).replace(/\[reference:\d+\]/gi, '');
  }

  function cleanText (value) {
    return stripEmoji(stripReferences(value == null ? '' : value));
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
        blocks.push({ type: 'paragraph', lines: paraLines });
      }
    }

    return blocks;
  }

  /**
   * Render a block descriptor to HTML
   */
  function renderBlock (block) {
    switch (block.type) {
      case 'paragraph':
        return '<p>' + renderInline(block.lines.join('\n')) + '</p>';

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
            return '<p class="prose-para">' + formatInline(para) + '</p>';
          }).join('');
    }
    var raw = cleanText(String(text));
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
