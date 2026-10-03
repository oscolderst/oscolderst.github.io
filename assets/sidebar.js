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
    menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>'
  };
  var SOCIALS = [
    ['Discord','https://discord.gg/mTDvkPcJn','<path d="M20.3 5.4A17.5 17.5 0 0 0 15.9 4l-.2.4c1.8.5 2.7 1.2 2.7 1.2-1.2-.6-2.4-1-3.5-1.1-.8-.1-1.6-.1-2.3 0-.1 0-.2 0-.3 0-1.2.1-2.4.5-3.6 1.1 0 0 1-.7 2.9-1.2l-.1-.3a17.6 17.6 0 0 0-4.4 1.3S2.5 10 3.9 17.5c0 0 1.5 2.2 5.5 2.4l.9-1.2c-1.6-.4-2.5-1-2.5-1s.2.1.6.3h.1c.1 0 .1.1.2.1a10 10 0 0 0 2 .6c.4.1.9.2 1.4.2 2.3.1 4.3-.4 4.3-.4.4-.1.9-.2 1.4-.3 0 0-.8.6-2.5 1l1 1.2c4 0 5.5-2.4 5.5-2.4 1.5-8-2.4-12.1-2.4-12.1zM9 14.6c-.8 0-1.5-.8-1.5-1.7 0-.9.6-1.7 1.5-1.7s1.5.8 1.5 1.7c0 .9-.7 1.7-1.5 1.7zm6 0c-.8 0-1.5-.8-1.5-1.7 0-.9.6-1.7 1.5-1.7s1.5.8 1.5 1.7c0 .9-.7 1.7-1.5 1.7z"/>'],
    ['Twitch','https://www.twitch.tv/oscolderst','<path d="M4 3 3 6v14h5v3h3l3-3h4l6-6V3H4zm16 10-3 3h-4l-3 3v-3H6V5h14v8z"/><path d="M15 7h2v5h-2zm-5 0h2v5h-2z"/>'],
    ['Instagram','https://www.instagram.com/oscolderst.clipes/','<path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.013-3.056.06-4.122.05-1.065.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.181-.8.398-1.15.748-.35.35-.566.683-.747 1.15-.137.352-.3.881-.344 1.857-.05 1.054-.06 1.37-.06 4.04 0 2.67.01 2.986.06 4.04.045.976.207 1.505.344 1.858.181.466.397.8.747 1.15.35.35.684.566 1.15.747.353.137.882.3 1.858.344 1.054.05 1.37.06 4.04.06 2.67 0 2.987-.01 4.04-.06.977-.045 1.506-.207 1.858-.344.466-.181.8-.397 1.15-.747.35-.35.566-.684.748-1.15.137-.353.3-.882.344-1.858.05-1.054.059-1.37.059-4.04 0-2.67-.01-2.986-.06-4.04-.045-.976-.207-1.505-.344-1.857a3.09 3.09 0 0 0-.747-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.882-.3-1.858-.344-1.054-.05-1.37-.059-4.04-.059zm0 4.594a5.604 5.604 0 1 1 0 11.208 5.604 5.604 0 0 1 0-11.208zm0 9.242a3.638 3.638 0 1 0 0-7.276 3.638 3.638 0 0 0 0 7.276zm7.137-9.464a1.31 1.31 0 1 1-2.62 0 1.31 1.31 0 0 1 2.62 0z"/>'],
    ['YouTube','https://www.youtube.com/@oscolderstclips','<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>']
  ];

  var NAV = [
    { href:'/',             icon:'home', label:'In&iacute;cio' },
    { href:'/offers/',      icon:'gift', label:'Ofertas' },
    { href:'/live/',        icon:'live', label:'Ao Vivo' },
    { href:'/clips/',       icon:'clip', label:'Clipes' },
    { href:'/bonus-hunts/', icon:'star', label:'Bonus Hunts' },
    { group:'Links' },
    { href:'https://www.twitch.tv/oscolderst', icon:'twitch', label:'Stream', ext:true },
    { href:'https://streamelements.com/taydodrill/store', icon:'bag', label:'Loja', ext:true }
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
      '<button class="side-toggle" id="sideToggle" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="sidebar">' + ICON.menu + '</button>' +
      '<span class="mobile-brand">oscolderst</span>' +
    '</div>' +
    '<div class="side-backdrop" id="sideBackdrop"></div>' +
    '<aside class="sidebar" id="sidebar">' +
      '<div class="side-brand">' +
        '<div class="brand-avatar">' +
          '<img src="/assets/img/avatar.jpg" alt="oscolderst">' +
          '<span class="live-dot" id="liveDot"></span>' +
        '</div>' +
        '<div class="brand-text">' +
          '<div class="brand-name">oscolderst</div>' +
          '<div class="brand-meta">' +
            '<span class="live-stat" id="viewerStat"><span class="pulse"></span><span id="viewerCount">0</span>&nbsp;a assistir</span>' +
            '<span class="meta-sep" id="viewerSep" style="display:none;">&middot;</span>' +
            '<span><span id="followerCount">&hellip;</span>&nbsp;seguidores</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="side-promos">' +
        '<a class="side-promo accent" href="/offers/">' +
          '<span class="promo-icon">' + ICON.gift + '</span>' +
          '<span><span class="promo-label">Reclama</span><span class="promo-title">Ofertas</span></span>' +
        '</a>' +
        '<a class="side-promo ghost" href="https://streamelements.com/taydodrill/store" target="_blank" rel="noopener">' +
          '<span class="promo-icon">' + ICON.bag + '</span>' +
          '<span><span class="promo-label">Merch</span><span class="promo-title">Loja</span></span>' +
        '</a>' +
      '</div>' +
      '<nav class="side-nav">' + navHtml() + '</nav>' +
      '<div class="side-socials">' +
        SOCIALS.map(function(s){
          return '<a href="' + s[1] + '" target="_blank" rel="noopener" aria-label="' + s[0] + '">' +
                 '<svg viewBox="0 0 24 24">' + s[2] + '</svg></a>';
        }).join('') +
      '</div>' +
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
