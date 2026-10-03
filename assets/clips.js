// Twitch clips grid, used by the home page and /clips/. Clips are fetched in
// the visitor's browser from Twitch's public GraphQL endpoint, the same way the
// follower counter works.
(function(){
  var CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
  var LOGIN = 'oscolderst';

  var grid = document.getElementById('clipsGrid');
  if(!grid) return;
  var empty = document.getElementById('clipsEmpty');
  var tabs = document.querySelectorAll('.filter-tab');
  var allCountEl = document.getElementById('allCount');

  function applyFilter(type){
    var cards = grid.querySelectorAll('.clip-card');
    if(type === 'all'){
      cards.forEach(function(c){ c.classList.remove('is-hidden'); });
      return;
    }
    var sorted = Array.prototype.slice.call(cards).sort(function(a, b){
      return (parseInt(b.dataset.views, 10) || 0) - (parseInt(a.dataset.views, 10) || 0);
    });
    var top = new Set(sorted.slice(0, 6));
    cards.forEach(function(c){ c.classList.toggle('is-hidden', !top.has(c)); });
  }

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tab.classList.add('active');
      applyFilter(tab.dataset.filter);
    });
  });

  function fmtDuration(sec){
    sec = Math.round(sec || 0);
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderClip(node){
    var a = document.createElement('a');
    a.className = 'clip-card';
    a.href = 'https://www.twitch.tv/' + LOGIN + '/clip/' + node.slug;
    a.target = '_blank';
    a.rel = 'noopener';
    a.dataset.views = node.viewCount || 0;
    a.innerHTML =
      '<div class="clip-thumb"><img src="" alt="" loading="lazy">' +
      '<span class="clip-duration"></span></div>' +
      '<div class="clip-info"><div class="clip-name"></div><div class="clip-meta"></div></div>';
    a.querySelector('.clip-thumb img').src = node.thumbnailURL || '';
    a.querySelector('.clip-duration').textContent = fmtDuration(node.durationSeconds);
    a.querySelector('.clip-name').textContent = node.title || '';
    a.querySelector('.clip-meta').textContent = (node.viewCount || 0) + ' views';
    return a;
  }

  function fail(){
    if(empty) empty.hidden = false;
    if(allCountEl) allCountEl.textContent = '0';
  }

  async function loadClips(){
    try{
      var res = await fetch('https://gql.twitch.tv/gql', {
        method: 'POST',
        headers: {'Client-ID': CLIENT_ID, 'Content-Type': 'text/plain;charset=UTF-8'},
        body: JSON.stringify({query: 'query { user(login:"' + LOGIN + '"){ clips(first:24, criteria:{filter: ALL_TIME}){ edges { node { slug title viewCount durationSeconds thumbnailURL } } } } }'})
      });
      var json = await res.json();
      var edges = json && json.data && json.data.user && json.data.user.clips && json.data.user.clips.edges;
      var nodes = (edges || []).map(function(e){ return e.node; }).filter(Boolean);
      if(!nodes.length) return fail();

      grid.innerHTML = '';
      nodes.forEach(function(node){ grid.appendChild(renderClip(node)); });
      if(empty) empty.hidden = true;
      if(allCountEl) allCountEl.textContent = nodes.length;
      var active = document.querySelector('.filter-tab.active');
      applyFilter(active ? active.dataset.filter : 'top');
    }catch(e){
      fail();
    }
  }

  loadClips();
})();
