// Offer cards: the "+" button opens the extra terms, and the code pill copies the code.
(function(){
  document.querySelectorAll('.deal-more').forEach(function(btn){
    btn.addEventListener('click', function(){
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Fewer details' : 'More details');
      if(panel) panel.hidden = !open;
    });
  });

  var COPY_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>';

  document.querySelectorAll('.deal-code-pill[data-copy]').forEach(function(pill){
    var code = pill.getAttribute('data-copy');
    pill.innerHTML = '<span class="code-text"></span>' + COPY_ICON;
    var text = pill.querySelector('.code-text');
    text.textContent = code;
    pill.addEventListener('click', function(){
      function done(){
        text.textContent = 'Copied!';
        pill.classList.add('is-copied');
        setTimeout(function(){ text.textContent = code; pill.classList.remove('is-copied'); }, 1500);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(done, function(){});
      }
    });
  });
})();
