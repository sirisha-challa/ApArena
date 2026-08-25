/* ApArena Coding Arena — Pyodide judge: worker-based execution with timeouts */
(function () {
  'use strict';

  var PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';
  var worker = null;
  var seq = 0;
  var pending = {};   // id -> {resolve, timer}

  function workerSource() {
    return [
      "importScripts('" + PYODIDE_URL + "pyodide.js');",
      "var pyPromise = null;",
      "function getPy() {",
      "  if (!pyPromise) pyPromise = loadPyodide({ indexURL: '" + PYODIDE_URL + "' });",
      "  return pyPromise;",
      "}",
      "onmessage = async function (e) {",
      "  var msg = e.data;",
      "  try {",
      "    var py = await getPy();",
      "    py.globals.set('__student_code', msg.code);",
      "    py.globals.set('__stdin_data', msg.stdin);",
      "    var resultJson = py.runPython([",
      "      'import sys, io, json, contextlib, traceback',",
      "      'sys.stdin = io.StringIO(__stdin_data)',",
      "      '_buf = io.StringIO()',",
      "      '_status = \\'ok\\'',",
      "      '_err = \\'\\'',",
      "      'try:',",
      "      '    with contextlib.redirect_stdout(_buf):',",
      "      '        exec(compile(__student_code, \\'<student>\\', \\'exec\\'), {\\'__name__\\': \\'__main__\\'})',",
      "      'except SystemExit:',",
      "      '    pass',",
      "      'except BaseException as _e:',",
      "      '    _status = \\'error\\'',",
      "      '    _err = traceback.format_exc(limit=6)',",
      "      'json.dumps({\\'status\\': _status, \\'out\\': _buf.getvalue(), \\'err\\': _err})'",
      "    ].join('\\n'));",
      "    postMessage({ id: msg.id, ok: true, result: JSON.parse(resultJson) });",
      "  } catch (err) {",
      "    postMessage({ id: msg.id, ok: false, err: String(err) });",
      "  }",
      "};"
    ].join('\n');
  }

  function spawnWorker() {
    var blob = new Blob([workerSource()], { type: 'application/javascript' });
    var w = new Worker(URL.createObjectURL(blob));
    w.onmessage = function (e) {
      var msg = e.data;
      var entry = pending[msg.id];
      if (!entry) return;
      clearTimeout(entry.timer);
      delete pending[msg.id];
      entry.resolve(msg);
    };
    return w;
  }

  function ensureWorker() {
    if (!worker) {
      worker = spawnWorker();
      setPyStatus('loading Python runtime (first time ~10s)...');
    }
  }

  function setPyStatus(text) {
    var el = document.getElementById('py-status');
    if (el) el.textContent = 'runtime: ' + text;
  }

  function runOne(code, stdin, expected, timeoutMs) {
    return new Promise(function (resolve) {
      ensureWorker();
      var id = ++seq;
      pending[id] = {
        resolve: resolve,
        timer: setTimeout(function () {
          delete pending[id];
          // kill and respawn the worker — the only way to stop an infinite loop
          if (worker) worker.terminate();
          worker = spawnWorker();
          resolve({ ok: false, err: 'timeout', timeout: true });
        }, timeoutMs || 10000)
      };
      worker.postMessage({ id: id, code: code, stdin: stdin });
    });
  }

  function setSummary(kind, text) {
    var el = document.getElementById('judge-summary');
    if (!el) return;
    el.className = 'judge-summary ' + kind;
    el.innerHTML = text;
  }

  function tcCard(index, tc, result, hidden) {
    var badge = result
      ? (result.status === 'pass' ? '<span class="tc-badge pass">passed</span>'
        : result.status === 'timeout' ? '<span class="tc-badge fail">timeout</span>'
        : '<span class="tc-badge fail">failed</span>')
      : '<span class="tc-badge pending">queued</span>';
    var name = hidden ? 'Hidden test ' + index : 'Test ' + index;
    var body = '';
    if (result && result.status === 'error') {
      body += '<div class="runtime-error">' + Judge.esc(result.err || 'Runtime error') + '</div>';
    }
    if (result && result.status === 'timeout') {
      body += '<div class="runtime-error">Time limit exceeded — check for an infinite loop (the runtime was restarted).</div>';
    }
    var gotShown = result ? Judge.esc(Judge.norm(result.out) || '(no output)') : '—';
    body += '<div class="tc-row"><span class="k">Input</span><pre>' + Judge.esc(tc.stdin.replace(/\n$/, '')) + '</pre></div>' +
      '<div class="tc-row"><span class="k">Expected</span><pre class="good">' + Judge.esc(tc.expected) + '</pre></div>' +
      '<div class="tc-row"><span class="k">Got</span><pre class="' + (result && result.status === 'pass' ? 'good' : (result ? 'bad' : '')) + '">' + gotShown + '</pre></div>';
    return '<div class="tc-card"><div class="tc-head">' + name +
      (hidden ? ' <span style="color:var(--text-3);font-weight:400">(hidden)</span>' : '') +
      badge + '</div><div class="tc-body">' + body + '</div></div>';
  }

  async function run(problem, allTests) {
    var ed = document.getElementById('editor');
    var code = ed.value;
    var tests = allTests ? problem.tests : problem.samples;
    var listEl = document.getElementById('judge-list');
    var btnS = document.getElementById('btn-run-sample');
    var btnA = document.getElementById('btn-run-all');
    btnS.disabled = true; btnA.disabled = true;
    setPyStatus('running...');
    setSummary('idle', 'Running ' + tests.length + ' test case' + (tests.length > 1 ? 's' : '') + '...');

    // placeholder cards
    listEl.innerHTML = tests.map(function (tc, i) {
      var hidden = !allTests && false;
      return tcCard(i + 1, tc, null, !problem.samples.some(function (s) { return s.stdin === tc.stdin; }));
    }).join('');

    var results = [];
    for (var i = 0; i < tests.length; i++) {
      var tc = tests[i];
      var msg = await runOne(code, tc.stdin, tc.expected, 10000);
      var res;
      if (!msg.ok && msg.timeout) {
        res = { status: 'timeout', out: '', err: '' };
      } else if (!msg.ok) {
        res = { status: 'error', out: '', err: msg.err };
      } else {
        var r = msg.result;
        if (r.status === 'error') {
          res = { status: 'error', out: r.out, err: r.err };
        } else {
          res = { status: Judge.norm(r.out) === Judge.norm(tc.expected) ? 'pass' : 'fail', out: r.out, err: '' };
        }
      }
      results.push(res);
      // refresh only the changed card
      var hidden = !problem.samples.some(function (s) { return s.stdin === tc.stdin; });
      var cards = listEl.querySelectorAll('.tc-card');
      if (cards[i]) {
        var tmp = document.createElement('div');
        tmp.innerHTML = tcCard(i + 1, tc, res, hidden);
        cards[i].replaceWith(tmp.firstChild);
      }
      setPyStatus('running... test ' + (i + 1) + '/' + tests.length);
    }

    btnS.disabled = false; btnA.disabled = false;
    var passed = results.filter(function (r) { return r.status === 'pass'; }).length;
    var all = passed === tests.length;
    setSummary(all ? 'pass' : 'fail',
      all ? '&#10003; All ' + tests.length + ' tests passed!' :
        passed + ' / ' + tests.length + ' passed' + (passed === 0 ? ' — read the walkthrough tab, then retry.' : ' — keep going.'));
    setPyStatus('idle');

    if (allTests && all && window.ARENA && ARENA._current) {
      var firstPass = !ARENA._state.solved[problem.id];
      ARENA.markSolved(problem.id);
      renderSidebarSafe();
      if (firstPass) ARENA.toast('Problem solved! "' + problem.title + '" checked off.', 'success');
    }
  }

  function renderSidebarSafe() {
    // re-render sidebar solved dots without leaving the problem view
    try {
      var evt = new CustomEvent('arena-solved-changed');
      document.dispatchEvent(evt);
    } catch (e) { /* no-op */ }
    if (window.ARENA && ARENA._refreshSidebar) ARENA._refreshSidebar();
  }

  window.Judge = {
    ensureWorker: ensureWorker,
    run: run,
    esc: function (s) {
      return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    norm: function (s) {
      var lines = String(s == null ? '' : s).replace(/\r/g, '').split('\n').map(function (l) { return l.replace(/\s+$/, ''); });
      while (lines.length && lines[lines.length - 1] === '') lines.pop();
      return lines.join('\n');
    }
  };
})();
