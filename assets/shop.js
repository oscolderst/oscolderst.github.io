// Shop page: lists the channel's StreamElements loyalty store items on the site.
// Redeeming needs a StreamElements login with Twitch, so each item opens the
// store there. Items load in the visitor's browser from the public API.
(function(){
  var CHANNEL = 'taydodrill';
  var STORE_URL = 'https://streamelements.com/taydodrill/store';
  var API = 'https://api.streamelements.com/kappa/v2';

  var grid = document.getElementById('shopGrid');
  var status = document.getElementById('shopStatus');
  if(!grid || !status) return;

  function getJSON(url){
    return fetch(url).then(function(r){
      if(!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  function el(tag, cls, text){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(text != null) e.textContent = text;
    return e;
  }

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

  function card(item, pointsName){
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
    var cost = Number(item.cost) || 0;
    foot.appendChild(el('span', 'shop-cost', cost.toLocaleString('en-GB') + ' ' + pointsName));
    var a = el('a', 'shop-redeem', soldOut ? 'Sold out' : 'Redeem');
    a.href = STORE_URL; a.target = '_blank'; a.rel = 'noopener';
    if(soldOut) a.setAttribute('aria-disabled', 'true');
    foot.appendChild(a);
    body.appendChild(foot);

    art.appendChild(body);
    return art;
  }

  showStatus('Loading the shop…', false);

  getJSON(API + '/channels/' + encodeURIComponent(CHANNEL))
    .then(function(channel){
      var id = channel && channel._id;
      if(!id) throw new Error('channel not found');
      var points = getJSON(API + '/loyalty/' + id)
        .then(function(d){ return (d && d.loyalty && d.loyalty.name) || (d && d.name) || 'points'; })
        .catch(function(){ return 'points'; });
      return Promise.all([getJSON(API + '/store/' + id + '/items'), points]);
    })
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
})();
