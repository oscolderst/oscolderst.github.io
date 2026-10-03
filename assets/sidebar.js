// Builds the left sidebar on every page. Kept in one place on purpose: the old
// per-page copies drifted (one page once had the markup but not its script).
(function(){
  var ICON = {
    home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
    gift:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>',
    star:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.6 6.6L21 10l-5 4.4L17.4 21 12 17.6 6.6 21 8 14.4 3 10l6.4-1.4z"/></svg>',
    live:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="15" height="12" rx="2"/><path d="M17 11l5-3v10l-5-3z"/></svg>',
    clip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9l5 3-5 3z"/></svg>',
    twitch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l-4 4v-4H6V4h14v10l-3 3z"/></svg>',
    bag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    ext:'<svg class="ext" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14L21 3"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
  };

  var NAV = [
    { href:'/',             icon:'home', label:'Home' },
    { href:'/offers/',      icon:'gift', label:'Offers' },
    { href:'/live/',        icon:'live', label:'Live' },
    { href:'/clips/',       icon:'clip', label:'Clips' },
    { href:'/bonus-hunts/', icon:'star', label:'Bonus Hunts' },
    { group:'Links' },
    { href:'https://www.twitch.tv/oscolderst', icon:'twitch', label:'Stream', ext:true },
    { href:'https://streamelements.com/taydodrill/store', icon:'bag', label:'Shop', ext:true },
    { href:'/community/', icon:'users', label:'Community' }
  ];

  function navHtml(){
    return NAV.map(function(i){
      if(i.group) return '<div class="side-group">' + i.group + '</div>';
      var attrs = i.ext ? ' target="_blank" rel="noopener"' : '';
      return '<a href="' + i.href + '"' + attrs + '>' + ICON[i.icon] + i.label + (i.ext ? ICON.ext : '') + '</a>';
    }).join('');
  }

  var markup =
    '<div class="mobile-bar">' +
      '<button class="side-toggle" id="sideToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="sidebar">' + ICON.menu + '</button>' +
      '<a class="mobile-brand" href="/" aria-label="oscolderst home"><img src="/assets/img/logo.webp" alt="oscolderst" width="640" height="141"></a>' +
    '</div>' +
    '<div class="side-backdrop" id="sideBackdrop"></div>' +
    '<aside class="sidebar" id="sidebar">' +
      '<a class="side-brand" href="/" aria-label="oscolderst home">' +
        '<img class="brand-logo" src="/assets/img/logo.webp" alt="oscolderst" width="640" height="141">' +
      '</a>' +
      '<div class="side-promos">' +
        '<a class="side-promo accent" href="/offers/">' +
          '<span class="promo-icon">' + ICON.gift + '</span>' +
          '<span><span class="promo-label">Claim</span><span class="promo-title">Offers</span></span>' +
        '</a>' +
        '<a class="side-promo ghost" href="https://streamelements.com/taydodrill/store" target="_blank" rel="noopener">' +
          '<span class="promo-icon">' + ICON.bag + '</span>' +
          '<span><span class="promo-title">Shop</span></span>' +
        '</a>' +
      '</div>' +
      '<nav class="side-nav">' + navHtml() + '</nav>' +
    '</aside>';

  document.body.insertAdjacentHTML('afterbegin', markup);

  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sideToggle');
  var backdrop = document.getElementById('sideBackdrop');

  function setOpen(open){
    sidebar.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', function(){ setOpen(!sidebar.classList.contains('is-open')); });
  backdrop.addEventListener('click', function(){ setOpen(false); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') setOpen(false); });
  sidebar.addEventListener('click', function(e){ if(e.target.closest('a')) setOpen(false); });
  window.addEventListener('resize', function(){ if(window.innerWidth > 1024) setOpen(false); });

  function normalise(p){ return p.replace(/index\.html$/, '').replace(/\/+$/, '') || '/'; }
  var here = normalise(location.pathname);
  sidebar.querySelectorAll('.side-nav a').forEach(function(a){
    if(a.target === '_blank') return;
    if(normalise(a.pathname) === here) a.classList.add('is-active');
  });
})();
