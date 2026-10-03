// 18+ confirmation gate. The markup sits in each page so it paints immediately;
// only the behaviour lives here.
(function(){
  var gate = document.getElementById('ageGate');
  if(!gate) return;

  if(localStorage.getItem('oscolderst_age_ok') === 'true'){
    gate.classList.add('hidden');
  } else {
    document.body.style.overflow = 'hidden';
  }

  gate.querySelectorAll('[data-age]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(btn.dataset.age === 'ok'){
        localStorage.setItem('oscolderst_age_ok', 'true');
        gate.classList.add('hidden');
        document.body.style.overflow = '';
      } else {
        window.location.href = 'https://www.google.com';
      }
    });
  });
})();
