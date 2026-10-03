// Sidebar behaviour shared by index.html and bonus-hunts.html: the mobile
// open/close drawer, and highlighting whichever nav entry points at the page
// you are on (done here so neither page carries its own hand-marked copy).
(function(){
  var sidebar = document.getElementById('sidebar');
  var toggle = document.getElementById('sideToggle');
  var backdrop = document.getElementById('sideBackdrop');
  if(!sidebar) return;

  function setOpen(open){
    sidebar.classList.toggle('is-open', open);
    if(backdrop) backdrop.classList.toggle('is-open', open);
    if(toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if(toggle) toggle.addEventListener('click', function(){
    setOpen(!sidebar.classList.contains('is-open'));
  });
  if(backdrop) backdrop.addEventListener('click', function(){ setOpen(false); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') setOpen(false);
  });
  // Anchor links scroll the page behind the open drawer, so close it first.
  sidebar.addEventListener('click', function(e){
    if(e.target.closest('a')) setOpen(false);
  });
  window.addEventListener('resize', function(){
    if(window.innerWidth > 1024) setOpen(false);
  });

  var here = location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  sidebar.querySelectorAll('.side-nav a').forEach(function(a){
    if(a.target === '_blank') return;
    var path = a.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    if(path !== here) return;
    // On the current page, an anchor entry only wins once you scroll to it.
    if(a.hash) return;
    a.classList.add('is-active');
  });
})();
