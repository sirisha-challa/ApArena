(function(){
  // ponytail: tiny bootstrapper — reads data-bank from <body> or window.AP_BANK_ID, loads the single manifest and starts the bank shell.
  var bankId = (document.body.getAttribute('data-bank') || window.AP_BANK_ID || location.pathname.split('/').filter(Boolean)[0] || 'aptitude').toLowerCase();
  function loadScript(src, cb){
    var s=document.createElement('script'); s.src=src; s.defer=false;
    s.onload=cb; s.onerror=function(){ console.error('load failed',src); cb(); };
    document.body.appendChild(s);
  }
  // expose early for app.js per-bank scoping
  window.AP_BANK_ID = bankId;
  // fetch bank manifest once, then TOPICS_INDEX for this bank
  fetch('/data/banks.json', {cache:'default'}).then(function(r){ return r.ok? r.json(): null; }).catch(function(){return null;}).then(function(manifest){
    window.BANKS_MANIFEST = manifest;
    return fetch('/data/' + bankId + '.json', {cache:'default'});
  }).then(function(r){
    if(!r || !r.ok) throw new Error('bank json '+r.status);
    return r.json();
  }).then(function(json){
    window.TOPICS_INDEX = json;
    // now load renderer then app — cache-bust for lovely fixes
    var v='5';
    var prose=document.createElement('script'); prose.src='/js/renderer/prose.js?v='+v;
    prose.onload=function(){
      loadScript('/js/app.js?v='+v, function(){});
    };
    document.body.appendChild(prose);
    // also bust CSS
    var css=document.querySelector('link[href="/css/style.css"]');
    if(css) css.href='/css/style.css?v='+v;
    else {
      var l=document.createElement('link'); l.rel='stylesheet'; l.href='/css/style.css?v='+v; document.head.appendChild(l);
    }
  }).catch(function(e){
    console.error('bank boot failed',e);
    document.getElementById('header-title').textContent='Error';
    var el=document.getElementById('app-content');
    if(el) el.innerHTML='<div class="page-content"><div class="empty-state">Failed to load bank “'+bankId+'”. Check /data/'+bankId+'.json exists.<br><small>'+(e.message||e)+'</small></div></div>';
  });
})();
