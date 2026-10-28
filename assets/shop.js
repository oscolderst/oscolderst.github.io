// Shop page: the channel's StreamElements loyalty store, plus "your points".
// Store items load in the visitor's browser from the public StreamElements API;
// redeeming needs a StreamElements login, so each item opens the store there.
// "Your points": the visitor logs in with Twitch (implicit OAuth, no server),
// we read their Twitch username from the token, revoke the token straight away,
// and look the username up in the public StreamElements points API. Only the
// username is kept, in localStorage, until they log out.
(function(){
  var CHANNEL = 'taydodrill';
  var STORE_URL = 'https://streamelements.com/taydodrill/store';
  var API = 'https://api.streamelements.com/kappa/v2';
  var TWITCH_CLIENT_ID = 'oibkvy081u7ca43quphnn7cina3l0b';
  // Must match the OAuth Redirect URL registered for the app on dev.twitch.tv.
  var REDIRECT_URI = 'https://oscolderst.com/shop/';
  var USER_KEY = 'oscolderst_twitch_user';
  var STATE_KEY = 'oscolderst_twitch_state';

  var grid = document.getElementById('shopGrid');
  var status = document.getElementById('shopStatus');
  var panel = document.getElementById('pointsPanel');
  if(!grid || !status) return;

  function getJSON(url, opts){
    return fetch(url, opts).then(function(r){
      if(!r.ok){ var e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
      return r.json();
    });
  }

  function el(tag, cls, text){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text != null) e.textContent = text;
    return e;
  }

  function store(get, key, value){
    try{
      if(get) return localStorage.getItem(key);
      if(value == null) localStorage.removeItem(key); else localStorage.setItem(key, value);
    }catch(e){}
    return null;
  }
  function session(get, key, value){
    try{
      if(get) return sessionStorage.getItem(key);
      if(value == null) sessionStorage.removeItem(key); else sessionStorage.setItem(key, value);
    }catch(e){}
    return null;
  }

  var channelId = getJSON(API + '/channels/' + encodeURIComponent(CHANNEL)).then(function(c){
    if(!c || !c._id) throw new Error('channel not found');
    return c._id;
  });
  var pointsName = channelId
    .then(function(id){ return getJSON(API + '/loyalty/' + id); })
    .then(function(d){ return (d && d.loyalty && d.loyalty.name) || (d && d.name) || 'points'; })
    .catch(function(){ return 'points'; });

  function fmt(n){ return (Number(n) || 0).toLocaleString('en-GB'); }

  /* ---------------- store items ---------------- */

  function showStatus(message, withLink){
    status.innerHTML = '';
    status.appendChild(el('p', null, message));
    if(withLink){
      var a = el('a', 'shop-redeem', 'Open the shop on StreamElements →');
      a.href = STORE_URL; a.target = '_blank'; a.rel = 'noopener';
      status.appendChild(a);
    }
    status.hidden = false;
  }

  function thumb(item){
    if(typeof item.thumbnail === 'string' && item.thumbnail) return item.thumbnail;
    var g = item.alert && item.alert.graphics;
    if(g && typeof g.src === 'string' && g.type !== 'video') return g.src;
    return '';
  }

  // quantity.total is -1 (or missing) for unlimited items; current is what is left.
  function stock(item){
    var q = item.quantity;
    if(!q || typeof q.total !== 'number' || q.total < 0) return null;
    return typeof q.current === 'number' ? q.current : q.total;
  }

  function card(item, unit){
    var left = stock(item);
    var soldOut = left !== null && left <= 0;

    var art = el('article', 'shop-item' + (soldOut ? ' is-sold-out' : ''));

    var media = el('div', 'shop-media');
    var src = thumb(item);
    if(src){
      var img = el('img');
      img.src = src; img.alt = item.name || ''; img.loading = 'lazy';
      img.onerror = function(){ media.classList.add('no-image'); img.remove(); };
      media.appendChild(img);
    } else {
      media.classList.add('no-image');
    }
    var tags = el('div', 'shop-tags');
    if(item.featured) tags.appendChild(el('span', 'shop-tag is-featured', 'Featured'));
    if(item.subscriberOnly) tags.appendChild(el('span', 'shop-tag', 'Subs only'));
    if(soldOut) tags.appendChild(el('span', 'shop-tag is-out', 'Sold out'));
    else if(left !== null) tags.appendChild(el('span', 'shop-tag', left + ' left'));
    if(tags.children.length) media.appendChild(tags);
    art.appendChild(media);

    var body = el('div', 'shop-body');
    body.appendChild(el('h3', 'shop-name', item.name || 'Item'));
    if(item.description) body.appendChild(el('p', 'shop-desc', item.description));

    var foot = el('div', 'shop-foot');
    foot.appendChild(el('span', 'shop-cost', fmt(item.cost) + ' ' + unit));
    var a = el('a', 'shop-redeem', soldOut ? 'Sold out' : 'Redeem');
    a.href = STORE_URL; a.target = '_blank'; a.rel = 'noopener';
    if(soldOut) a.setAttribute('aria-disabled', 'true');
    foot.appendChild(a);
    body.appendChild(foot);

    art.appendChild(body);
    return art;
  }

  showStatus('Loading the shop…', false);

  channelId
    .then(function(id){ return Promise.all([getJSON(API + '/store/' + id + '/items'), pointsName]); })
    .then(function(res){
      var list = Array.isArray(res[0]) ? res[0] : (res[0] && res[0].items) || [];
      var items = list.filter(function(i){ return i && i.enabled !== false; });
      items.sort(function(a, b){
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (Number(a.cost) || 0) - (Number(b.cost) || 0);
      });
      if(!items.length){ showStatus('The shop is empty right now.', true); return; }
      grid.innerHTML = '';
      items.forEach(function(i){ grid.appendChild(card(i, res[1])); });
      status.hidden = true;
    })
    .catch(function(){
      showStatus('Couldn’t load the shop right now.', true);
    });

  /* ---------------- your points (Twitch login) ---------------- */

  if(!panel) return;

  var TWITCH_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3 3 6v14h5v3h3l3-3h4l6-6V3H4zm16 10-3 3h-4l-3 3v-3H6V5h14v8z"/><path d="M15 7h2v5h-2zm-5 0h2v5h-2z"/></svg>';

  function renderLoggedOut(message){
    panel.innerHTML = '';
    var text = el('div', 'points-text');
    text.appendChild(el('div', 'points-title', 'Your points'));
    text.appendChild(el('div', 'points-sub', message || 'Log in with Twitch to see how many points you have.'));
    panel.appendChild(text);
    var btn = el('button', 'twitch-login');
    btn.type = 'button';
    btn.innerHTML = TWITCH_ICON + '<span>Log in with Twitch</span>';
    btn.addEventListener('click', startLogin);
    panel.appendChild(btn);
  }

  function renderBusy(message){
    panel.innerHTML = '';
    var text = el('div', 'points-text');
    text.appendChild(el('div', 'points-title', 'Your points'));
    text.appendChild(el('div', 'points-sub', message));
    panel.appendChild(text);
  }

  function renderUser(login, value, rank, unit, note){
    panel.innerHTML = '';
    var text = el('div', 'points-text');
    var who = el('div', 'points-sub');
    who.appendChild(document.createTextNode('Logged in as '));
    who.appendChild(el('b', null, login));
    text.appendChild(who);
    if(value != null){
      var big = el('div', 'points-value');
      big.appendChild(el('span', 'points-num', fmt(value)));
      big.appendChild(el('span', 'points-unit', unit));
      text.appendChild(big);
      if(rank) text.appendChild(el('div', 'points-rank', 'Rank #' + fmt(rank)));
    }
    if(note) text.appendChild(el('div', 'points-sub', note));
    panel.appendChild(text);
    var out = el('button', 'points-logout', 'Log out');
    out.type = 'button';
    out.addEventListener('click', function(){ store(false, USER_KEY, null); renderLoggedOut(); });
    panel.appendChild(out);
  }

  function startLogin(){
    var state = '';
    try{
      var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
      state = Array.prototype.map.call(bytes, function(b){ return ('0' + b.toString(16)).slice(-2); }).join('');
    }catch(e){ state = String(Math.random()).slice(2) + String(Date.now()); }
    session(false, STATE_KEY, state);
    location.href = 'https://id.twitch.tv/oauth2/authorize'
      + '?client_id=' + encodeURIComponent(TWITCH_CLIENT_ID)
      + '&redirect_uri=' + encodeURIComponent(REDIRECT_URI)
      + '&response_type=token&scope=&state=' + encodeURIComponent(state);
  }

  function showPoints(login){
    renderBusy('Checking your points…');
    Promise.all([channelId, pointsName])
      .then(function(r){
        return getJSON(API + '/points/' + r[0] + '/' + encodeURIComponent(login))
          .then(function(d){ renderUser(login, d && d.points, d && d.rank, r[1]); })
          .catch(function(e){
            if(e && e.status === 404) renderUser(login, 0, null, r[1], 'No points yet. Watch the stream to start earning.');
            else throw e;
          });
      })
      .catch(function(){ renderUser(login, null, null, '', 'Couldn’t load your points right now.'); });
  }

  // Back from Twitch: the token comes in the URL fragment (or an error in the query).
  function readReturn(){
    var hash = new URLSearchParams(location.hash.replace(/^#/, ''));
    var query = new URLSearchParams(location.search);
    var token = hash.get('access_token');
    var error = query.get('error') || hash.get('error');
    if(!token && !error) return null;
    var state = hash.get('state') || query.get('state');
    var expected = session(true, STATE_KEY);
    session(false, STATE_KEY, null);
    try{ history.replaceState(null, '', location.pathname); }catch(e){}
    if(error) return { error: 'Login was cancelled.' };
    if(!expected || state !== expected){
      if(token) revoke(token);
      return { error: 'Login failed. Please try again.' };
    }
    return { token: token };
  }

  function revoke(token){
    fetch('https://id.twitch.tv/oauth2/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'client_id=' + encodeURIComponent(TWITCH_CLIENT_ID) + '&token=' + encodeURIComponent(token)
    }).catch(function(){});
  }

  var back = readReturn();
  if(back && back.error){
    renderLoggedOut(back.error);
  } else if(back && back.token){
    renderBusy('Logging you in…');
    getJSON('https://id.twitch.tv/oauth2/validate', { headers: { 'Authorization': 'OAuth ' + back.token } })
      .then(function(v){
        if(!v || v.client_id !== TWITCH_CLIENT_ID || !v.login) throw new Error('bad token');
        return v.login;
      })
      .then(function(login){
        revoke(back.token);
        store(false, USER_KEY, login);
        showPoints(login);
      })
      .catch(function(){ revoke(back.token); renderLoggedOut('Login failed. Please try again.'); });
  } else {
    var saved = store(true, USER_KEY);
    if(saved && /^[a-z0-9_]{1,25}$/i.test(saved)) showPoints(saved);
    else renderLoggedOut();
  }
})();
