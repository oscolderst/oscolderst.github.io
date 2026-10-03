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

  document.querySelectorAll('.deal-code-pill[data-copy]').forEach(function(pill){
    var code = pill.getAttribute('data-copy');
    pill.addEventListener('click', function(){
      function done(){
        pill.textContent = 'Copied!';
        pill.classList.add('is-copied');
        setTimeout(function(){ pill.textContent = code; pill.classList.remove('is-copied'); }, 1500);
      }
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(done, function(){});
      }
    });
  });
})();
