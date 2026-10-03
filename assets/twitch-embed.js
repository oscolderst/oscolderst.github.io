// Click-to-load Twitch player. The embed can set Twitch cookies, so it only
// loads once the visitor asks for it; that choice is remembered on this device.
(function(){
  var KEY = 'oscolderst_twitch_ok';
  var SRC = 'https://player.twitch.tv/?channel=oscolderst&parent=' + location.hostname + '&muted=true';

  function load(box){
    var f = document.createElement('iframe');
    f.src = SRC;
    f.allowFullscreen = true;
    f.setAttribute('allow', 'autoplay; fullscreen');
    f.title = 'oscolderst stream on Twitch';
    box.innerHTML = '';
    box.appendChild(f);
  }

  var remembered = false;
  try{ remembered = localStorage.getItem(KEY) === 'true'; }catch(e){}

  document.querySelectorAll('.live-embed[data-twitch]').forEach(function(box){
    if(remembered) return load(box);
    var btn = box.querySelector('.embed-gate-btn');
    if(!btn) return;
    btn.addEventListener('click', function(){
      try{ localStorage.setItem(KEY, 'true'); }catch(e){}
      document.querySelectorAll('.live-embed[data-twitch]').forEach(load);
    });
  });
})();
