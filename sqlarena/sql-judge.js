/* SQLArena — sql.js judge: in-browser SQLite with visible + hidden datasets */
(function () {
  'use strict';

  var SQL = null;
  var loading = null;

  function ensureLoaded() {
    if (SQL) return Promise.resolve(SQL);
    if (loading) return loading;
    setStatus('loading SQLite engine (~1MB, first time only)...');
    loading = new Promise(function (resolve, reject) {
      if (!window.initSqlJs) { reject(new Error('sql.js CDN failed to load')); return; }
      window.initSqlJs({ locateFile: function (f) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/' + f; } })
        .then(function (S) { SQL = S; setStatus('ready'); resolve(S); })
        .catch(reject);
    });
    // surface load errors in the status line instead of failing silently
    loading.catch(function (e) { setStatus('engine failed: ' + (e && e.message || e)); });
    return loading;
  }

  function setStatus(t) {
    var el = document.getElementById('sql-status');
    if (el) el.textContent = 'engine: ' + t;
  }

  function normVal(v) {
    if (v === null || v === undefined) return '';
    return v;
  }

  function valsEqual(a, b) {
    a = normVal(a); b = normVal(b);
    if (a === '' && b === '') return true;
    var na = Number(a), nb = Number(b);
    if (a !== '' && b !== '' && a !== null && !isNaN(na) && !isNaN(nb)) {
      return Math.abs(na - nb) < 0.011; // AVG / *1.1 float tolerance
    }
    return String(a) === String(b);
  }

  function colsEqual(got, want) {
    if (!got || got.length !== want.length) return false;
    for (var i = 0; i < want.length; i++) {
      if (String(got[i]).toLowerCase() !== String(want[i]).toLowerCase()) return false;
    }
    return true;
  }

  function rowsEqual(got, want, ordered) {
    if (got.length !== want.length) return false;
    var key = function (r) { return JSON.stringify(r.map(function (v) { return String(normVal(v)); })); };
    if (!ordered) {
      got = got.map(function (r) { return r; }).sort(function (a, b) { return key(a) < key(b) ? -1 : 1; });
      want = want.slice().sort(function (a, b) { return key(a) < key(b) ? -1 : 1; });
    }
    for (var i = 0; i < want.length; i++) {
      if (got[i].length !== want[i].length) return false;
      for (var j = 0; j < want[i].length; j++) {
        if (!valsEqual(got[i][j], want[i][j])) return false;
      }
    }
    return true;
  }

  function seedFor(problem, kind) {
    return kind === 'hidden' ? problem.hiddenSeedSQL : problem.seedSQL;
  }

  // Run student SQL against one dataset. Returns {status, cols, rows, err}.
  // status: 'ok' | 'error' | 'empty'
  function execStudent(problem, kind, studentSQL) {
    var db = new SQL.Database();
    try {
      db.exec(problem.schemaSQL);
      db.exec(seedFor(problem, kind));
      var res = null;
      if (problem.dml) {
        db.exec(studentSQL); // statement(s) mutate the DB
        var v = db.exec(problem.verify);
        res = v.length ? v[v.length - 1] : null;
      } else {
        var out = db.exec(studentSQL);
        // take the last result set that has columns (multi-statement safe)
        for (var i = out.length - 1; i >= 0; i--) {
          if (out[i] && out[i].columns) { res = out[i]; break; }
        }
      }
      if (!res) return { status: 'empty', cols: [], rows: [] };
      return { status: 'ok', cols: res.columns, rows: res.values };
    } catch (e) {
      return { status: 'error', cols: [], rows: [], err: String((e && e.message) || e) };
    } finally {
      try { db.close(); } catch (e2) { /* no-op */ }
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function resultTable(cols, rows, cap) {
    cap = cap || 20;
    if (!cols.length) return '<div class="sql-empty">No result set. SELECT queries return rows; check your statement.</div>';
    var shown = rows.slice(0, cap);
    var h = '<div class="sql-table-wrap"><table class="sql-table"><thead><tr>' +
      cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    if (!shown.length) h += '<tr><td colspan="' + cols.length + '" class="sql-null">(0 rows)</td></tr>';
    h += shown.map(function (r) {
      return '<tr>' + r.map(function (v) {
        return v === null || v === undefined || v === ''
          ? '<td class="sql-null">NULL</td>' : '<td>' + esc(v) + '</td>';
      }).join('') + '</tr>';
    }).join('') + '</tbody></table></div>';
    if (rows.length > cap) h += '<div class="sql-more">Showing ' + cap + ' of ' + rows.length + ' rows.</div>';
    return h;
  }

  function setSummary(kind, html) {
    var el = document.getElementById('judge-summary');
    if (!el) return;
    el.className = 'judge-summary ' + kind;
    el.innerHTML = html;
  }

  function tcCard(name, hidden, verdict, detail) {
    var badge = verdict === 'pass' ? '<span class="tc-badge pass">passed</span>'
      : verdict === 'fail' ? '<span class="tc-badge fail">failed</span>'
      : verdict === 'error' ? '<span class="tc-badge fail">error</span>'
      : '<span class="tc-badge pending">queued</span>';
    return '<div class="tc-card"><div class="tc-head">' + esc(name) +
      (hidden ? ' <span style="color:var(--text-3);font-weight:400">(hidden dataset)</span>' : '') +
      badge + '</div><div class="tc-body">' + (detail || '') + '</div></div>';
  }

  function checkOne(problem, test, studentSQL) {
    var r = execStudent(problem, test.kind, studentSQL);
    if (r.status === 'error') return { verdict: 'error', run: r, msg: r.err };
    if (r.status === 'empty') return { verdict: 'fail', run: r, msg: 'Query returned no result set.' };
    if (!colsEqual(r.cols, test.expectedColumns)) {
      return {
        verdict: 'fail', run: r,
        msg: 'Column mismatch. Expected (' + test.expectedColumns.join(', ') + ') but got (' + (r.cols.join(', ') || 'none') + '). Column names and order must match.'
      };
    }
    if (r.rows.length !== test.expectedRows.length) {
      return {
        verdict: 'fail', run: r,
        msg: 'Row-count mismatch. Expected ' + test.expectedRows.length + ' row(s), got ' + r.rows.length + '.'
      };
    }
    if (!rowsEqual(r.rows, test.expectedRows, !!problem.ordered)) {
      return {
        verdict: 'fail', run: r,
        msg: problem.ordered
          ? 'Rows differ (order matters here — check ORDER BY).'
          : 'Rows differ (order does not matter here — compare as sets).'
      };
    }
    return { verdict: 'pass', run: r, msg: '' };
  }

  async function run(problem, allTests) {
    await ensureLoaded().catch(function () { /* status line shows the error */ });
    if (!SQL) {
      setSummary('fail', 'SQLite engine failed to load (CDN blocked?). Check connection and retry.');
      return;
    }
    var ed = document.getElementById('editor');
    var code = ed ? ed.value : '';
    var tests = allTests ? problem.tests : [problem.tests[0]];
    var listEl = document.getElementById('judge-list');
    var btnS = document.getElementById('btn-run-sample');
    var btnA = document.getElementById('btn-run-all');
    if (btnS) btnS.disabled = true;
    if (btnA) btnA.disabled = true;
    setStatus('running...');
    setSummary('idle', 'Running ' + tests.length + ' dataset' + (tests.length > 1 ? 's' : '') + '...');

    listEl.innerHTML = tests.map(function (t) {
      return tcCard(t.name, t.kind === 'hidden', null, '');
    }).join('');

    var verdicts = [];
    for (var i = 0; i < tests.length; i++) {
      var t = tests[i];
      var v;
      try {
        v = checkOne(problem, t, code);
      } catch (e) {
        v = { verdict: 'error', run: { cols: [], rows: [] }, msg: String((e && e.message) || e) };
      }
      verdicts.push(v);
      var detail = '';
      if (v.msg) detail += '<div class="runtime-error">' + esc(v.msg) + '</div>';
      if (v.verdict === 'error' && v.run && v.run.err) detail += '<div class="runtime-error">' + esc(v.run.err) + '</div>';
      detail += '<div class="tc-row"><span class="k">Expected</span><pre class="good">' +
        esc(t.expectedColumns.join(' | ') + '\n' + t.expectedRows.map(function (r) { return r.join(' | '); }).join('\n')) + '</pre></div>';
      if (v.run && v.run.status === 'ok') {
        detail += '<div class="tc-row"><span class="k">Got</span><pre class="' +
          (v.verdict === 'pass' ? 'good' : 'bad') + '">' +
          esc((v.run.cols.join(' | ') || '(none)') + '\n' + v.run.rows.map(function (r) {
            return r.map(function (x) { return x === null ? 'NULL' : x; }).join(' | ');
          }).join('\n')) + '</pre></div>';
      }
      var cards = listEl.querySelectorAll('.tc-card');
      if (cards[i]) {
        var tmp = document.createElement('div');
        tmp.innerHTML = tcCard(t.name, t.kind === 'hidden', v.verdict, detail);
        cards[i].replaceWith(tmp.firstChild);
      }
      setStatus('running... ' + (i + 1) + '/' + tests.length);
    }

    if (btnS) btnS.disabled = false;
    if (btnA) btnA.disabled = false;
    var passed = verdicts.filter(function (v) { return v.verdict === 'pass'; }).length;
    var all = passed === tests.length;
    // always show the student's own result table on the visible dataset
    var vis = execStudent(problem, 'visible', code);
    var preview = (vis.status === 'ok') ? resultTable(vis.cols, vis.rows) : '';
    setSummary(all ? 'pass' : 'fail',
      (all ? '&#10003; All ' + tests.length + ' dataset(s) passed!'
        : passed + ' / ' + tests.length + ' passed' + (passed === 0 ? ' — read the Approach tab, then retry.' : ' — keep going.')) +
      (preview ? '<div style="margin-top:10px;width:100%">' + preview + '</div>' : ''));
    setStatus('idle');

    if (allTests && all && window.ARENA && ARENA._current) {
      var firstPass = !ARENA._state.solved[problem.id];
      ARENA.markSolved(problem.id);
      if (ARENA._refreshSidebar) ARENA._refreshSidebar();
      if (firstPass) ARENA.toast('Solved! "' + problem.title + '" checked off.', 'success');
    }
  }

  window.SQLJudge = {
    ensureLoaded: ensureLoaded,
    run: run,
    execStudent: execStudent,
    resultTable: resultTable,
    esc: esc
  };
})();
