/* PseudoLSP — client-side language intelligence for Accenture-style pseudocode.
 * Provides: tokenizer, syntax-aware highlighter (indentation guides), and
 * LSP-style diagnostics (errors / warnings / hints) with a problems panel.
 * No external deps. */
(function (global) {
  'use strict';

  var VERSION = '1.0.0';

  var KEYWORDS = new Set([
    'DECLARE', 'AS', 'SET', 'INPUT', 'OUTPUT', 'PRINT', 'READ',
    'IF', 'THEN', 'ELSE', 'ELSEIF', 'ENDIF',
    'WHILE', 'DO', 'ENDWHILE', 'REPEAT', 'UNTIL',
    'FOR', 'TO', 'STEP', 'ENDFOR', 'FOREACH', 'IN', 'ENDFOREACH',
    'FUNCTION', 'RETURN', 'RETURNS', 'ENDFUNCTION', 'CALL',
    'CASE', 'OF', 'OTHERWISE', 'ENDCASE', 'BYVAL', 'BYREF',
    'MOD', 'DIV'
  ]);
  var TYPES = new Set(['INTEGER', 'REAL', 'STRING', 'BOOLEAN', 'CHAR', 'ARRAY']);
  var BOOLS = new Set(['TRUE', 'FALSE']);
  var BITWISE = new Set(['AND', 'OR', 'XOR', 'NOT']);
  var BLOCK_OPEN = { IF: 'ENDIF', WHILE: 'ENDWHILE', FOR: 'ENDFOR', FOREACH: 'ENDFOREACH', FUNCTION: 'ENDFUNCTION', CASE: 'ENDCASE' };
  var BLOCK_CLOSE = { ENDIF: 'IF', ENDWHILE: 'WHILE', ENDFOR: 'FOR', ENDFOREACH: 'FOREACH', ENDFUNCTION: 'FUNCTION', ENDCASE: 'CASE' };

  var MASTER = new RegExp(
    '(\\s+)' + // 1 whitespace
    '|(\\/\\/[^\\n]*)' + // 2 comment
    '|("(?:[^"\\\\\\n]|\\\\.)*")' + // 3 string
    '|([A-Za-z_][A-Za-z0-9_]*)' + // 4 identifier
    '|(\\d+(?:\\.\\d+)?)' + // 5 number
    '|(<<|>>|<=|>=|<>|!=|==|&&|\\|\\|)' + // 6 multi-char op
    '|([+\\-*\\/%^=<>!&|~()\\[\\],:;])' + // 7 single-char op/delim
    '|([@#$?{}\\x27"])', // 8 unknown (incl. lone quote → unterminated string)
    'g'
  );

  function classOf(word) {
    if (KEYWORDS.has(word)) return 'tk-kw';
    if (TYPES.has(word)) return 'tk-type';
    if (BOOLS.has(word)) return 'tk-bool';
    if (BITWISE.has(word)) return 'tk-op';
    return 'tk-var';
  }

  function isAssignTarget(tokens, i) {
    if (tokens[i].kind !== 'ident') return false;
    var prev = tokens[i - 1], next = tokens[i + 1];
    if (next && next.text === '=') return true;              // x = ...
    if (next && next.text === '[') return true;              // arr[..] = ...
    if (prev && (prev.text === 'SET' || prev.text === 'INPUT' || prev.text === 'READ' || prev.text === 'BYVAL' || prev.text === 'BYREF')) return true;
    if (prev && prev.text === 'DECLARE') return true;
    if (prev && (prev.text === 'FOR' || prev.text === 'CASE')) return true; // FOR i / CASE x
    if (prev && prev.text === 'FUNCTION') return true;       // FUNCTION f(...)
    return false;
  }

  /* Full scan: tokens (with line/col), diagnostics, per-line structure. */
  function analyze(code) {
    var tokens = [];
    var diagnostics = [];
    var lines = code.split('\n');
    var lineTokens = []; // per-line token arrays (for rendering)
    var declared = new Set();
    var stack = [];      // block openers: {kind, line, col}
    var warnCap = 6, totalDiags = 0;

    function diag(severity, message, line, col, len) {
      totalDiags++;
      if (severity === 'warning' && diagnostics.filter(function (d) { return d.severity === 'warning'; }).length >= warnCap) return;
      diagnostics.push({ severity: severity, message: message, line: line, col: col || 1, len: len || 1 });
    }

    lines.forEach(function (raw, li) {
      var ln = li + 1;
      var lw = raw.match(/^[ \t]*/)[0];
      var indentCols = lw.replace(/\t/g, '    ').length;
      var prevEnd = lw.length;
      var rest = raw.slice(lw.length);

      if (rest.trim().length && indentCols % 4 !== 0) {
        diag('hint', 'Indentation is not a multiple of 4 spaces', ln, 1, indentCols);
      }

      var lt = [];
      MASTER.lastIndex = 0;
      var m, tokensThisLine = [], paren = 0;
      while ((m = MASTER.exec(rest)) !== null) {
        var col = prevEnd + m.index + 1;
        var text = m[0];
        var kind, cls, isComment = false;
        if (m[1]) continue;
        if (m[2]) { kind = 'comment'; cls = 'tk-comment'; isComment = true; }
        else if (m[3]) { kind = 'string'; cls = 'tk-str'; }
        else if (m[4]) {
          var word = text;
          if (KEYWORDS.has(word) || TYPES.has(word) || BOOLS.has(word) || BITWISE.has(word)) {
            kind = 'word'; cls = classOf(word);
            if (BLOCK_OPEN[word]) stack.push({ kind: word, line: ln, col: col });
            if (BLOCK_CLOSE[word]) {
              var open = stack.pop();
              if (!open) diag('error', word + ' without matching ' + BLOCK_CLOSE[word], ln, col, word.length);
              else if (open.kind !== BLOCK_CLOSE[word]) {
                diag('error', 'Mismatched block end: ' + word + ' closes ' + BLOCK_CLOSE[word] + ', but ' + open.kind + ' (line ' + open.line + ') is open', ln, col, word.length);
                stack.push(open); // keep outer opener open
              }
            }
            if (word === 'UNTIL') {
              var r = stack.pop();
              if (!r) diag('error', 'UNTIL without matching REPEAT', ln, col, 5);
              else if (r.kind !== 'REPEAT') {
                diag('error', 'UNTIL closes REPEAT, but ' + r.kind + ' (line ' + r.line + ') is open', ln, col, 5);
                stack.push(r);
              }
            }
            if (word === 'REPEAT') stack.push({ kind: 'REPEAT', line: ln, col: col });
          } else {
            kind = 'ident'; cls = 'tk-var';
          }
        }
        else if (m[5]) { kind = 'number'; cls = 'tk-num'; }
        else if (m[6]) { kind = 'op'; cls = 'tk-op'; }
        else if (m[7]) {
          kind = 'op'; cls = 'tk-op';
          var ch = text;
          if (ch === '(') paren++;
          else if (ch === ')') paren--;
          else if (ch === '[') paren++;
          else if (ch === ']') paren--;
        }
        else if (m[8]) {
          kind = 'unknown'; cls = 'tk-err';
          if (text === '\x27' || text === '"') diag('error', 'Unterminated string literal', ln, col, 1);
          else diag('error', 'Unexpected character ' + JSON.stringify(text), ln, col, 1);
        }

        tokens.push({ kind: kind, text: text, cls: cls, line: ln, col: col });
        tokensThisLine.push({ text: text, kind: kind, cls: cls, line: ln, col: col });
        if (isComment) break; // rest of line is comment
      }

      if (paren !== 0) diag('error', 'Unbalanced parentheses', ln, Math.max(1, indentCols + 1), 1);

      lineTokens.push({ indent: lw.replace(/\t/g, '    '), tokens: tokensThisLine });
    });

    // undeclared identifier warnings (second pass over the flat token list)
    var afterUnknown = false;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (t.kind === 'unknown') { afterUnknown = true; continue; }
      if (t.line !== (tokens[i - 1] || t).line) afterUnknown = false;
      if (t.kind !== 'ident') continue;
      if (isAssignTarget(tokens, i)) { declared.add(t.text); continue; }
      if (t.text === 'CALL' || t.text === 'RETURN') continue;
      var prevTok = tokens[i - 1];
      if (prevTok && prevTok.text === 'CALL') continue; // function name after CALL
      if (afterUnknown) continue; // inside a broken construct (e.g. unterminated string)
      if (!declared.has(t.text)) {
        diag('warning', "'" + t.text + "' is used but never declared", t.line, t.col, t.text.length);
      }
    }

    // unclosed blocks
    var leftover = stack.slice(0, 8);
    leftover.forEach(function (b) {
      diag('error', 'Unclosed ' + b.kind + ' block (opened line ' + b.line + '): expected ' + (BLOCK_OPEN[b.kind] || 'UNTIL'), b.line, b.col, b.kind.length);
    });

    var counts = { error: 0, warning: 0, hint: 0 };
    diagnostics.forEach(function (d) { counts[d.severity]++; });

    return {
      tokens: tokens,
      lineTokens: lineTokens,
      diagnostics: diagnostics,
      counts: counts,
      totalDiags: totalDiags
    };
  }

  var SEV_ICON = { error: 'err', warning: 'warn', hint: 'hint' };

  /* Render a pseudocode block to HTML: line numbers, indentation guides,
   * highlighted tokens, highlighted lines, and (optionally) the problems panel. */
  function render(code, opts) {
    opts = opts || {};
    var a = analyze(code);
    var html = [];
    html.push('<div class="code-body">');
    a.lineTokens.forEach(function (lt, i) {
      var ln = i + 1;
      var hl = opts.lineHighlights && opts.lineHighlights.indexOf(ln) !== -1 ? ' code-line-hl' : '';
      html.push('<div class="code-line' + hl + '">');
      html.push('<span class="ln">' + ln + '</span>');
      if (lt.indent.length) {
        html.push('<span class="code-indent">');
        var guides = Math.floor(lt.indent.length / 4);
        for (var g = 0; g < guides; g++) html.push('<span class="guide" aria-hidden="true"></span>');
        var rem = lt.indent.length % 4;
        if (rem) html.push('<span class="indent-rem">' + escapeHtml(lt.indent.slice(-rem)) + '</span>');
        html.push('</span>');
      }
      if (!lt.tokens.length && !lt.indent.length) { html.push('<span class="code-empty">\u00a0</span>'); }
      lt.tokens.forEach(function (t) {
        html.push('<span class="' + t.cls + '">' + escapeHtml(t.text) + '</span>');
      });
      html.push('</div>');
    });
    html.push('</div>');

    var problems = '';
    if (a.diagnostics.length) {
      problems = '<div class="code-problems" hidden><div class="problems-head">Problems</div>';
      a.diagnostics.forEach(function (d) {
        problems += '<div class="problem-item p-' + d.severity + '"><span class="problem-ico" aria-hidden="true"></span><span class="problem-msg">' + escapeHtml(d.message) + '</span><span class="problem-pos">' + d.line + ':' + d.col + '</span></div>';
      });
      problems += '</div>';
    }

    var issues = '';
    var n = a.counts.error + a.counts.warning + a.counts.hint;
    if (n) {
      var bits = [];
      if (a.counts.error) bits.push(a.counts.error + ' error' + (a.counts.error > 1 ? 's' : ''));
      if (a.counts.warning) bits.push(a.counts.warning + ' warning' + (a.counts.warning > 1 ? 's' : ''));
      if (a.counts.hint) bits.push(a.counts.hint + ' hint' + (a.counts.hint > 1 ? 's' : ''));
      issues = '<button class="issues-btn" data-action="toggle-problems" aria-expanded="false"><span class="issues-dot" aria-hidden="true"></span>' + n + ' issue' + (n > 1 ? 's' : '') + '<span class="issues-detail">' + bits.join(' · ') + '</span></button>';
    } else {
      issues = '<span class="issues-btn ok" title="No issues — clean analysis"><span class="ok-dot" aria-hidden="true"></span>clean</span>';
    }

    return {
      html: html.join(''),
      problems: problems,
      issues: issues,
      counts: a.counts,
      lineCount: a.lineTokens.length
    };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  global.PseudoLSP = { analyze: analyze, render: render, VERSION: VERSION };
})(window);
