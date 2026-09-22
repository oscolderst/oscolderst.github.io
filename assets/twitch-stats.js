// Live follower / viewer counters in the site header. Shared by index.html and
// bonus-hunts.html: the markup was once copied between pages without this
// script, which left the counters stuck on their placeholders.
(function(){
  var CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';
  var LOGIN = 'oscolderst';
  function fmt(n){
    if(n>=10000){ return Math.round(n/1000) + 'K'; }
    if(n>=1000){ return (n/1000).toFixed(1).replace('.0','') + 'K'; }
    return String(n);
  }
  async function loadStats(){
    try{
      var res = await fetch('https://gql.twitch.tv/gql', {
        method:'POST',
        headers:{'Client-ID':CLIENT_ID,'Content-Type':'text/plain;charset=UTF-8'},
        body: JSON.stringify({query:'query { user(login:"'+LOGIN+'"){ followers{totalCount} stream{viewersCount} } }'})
      });
      var json = await res.json();
      var u = json && json.data && json.data.user;
      if(!u) return;
      var viewerStat = document.getElementById('viewerStat');
      var viewerSep = document.getElementById('viewerSep');
      var viewerCount = document.getElementById('viewerCount');
      var followerCount = document.getElementById('followerCount');
      var liveDot = document.getElementById('liveDot');
      if(u.stream && u.stream.viewersCount != null){
        viewerCount.textContent = fmt(u.stream.viewersCount);
        viewerStat.style.display = 'inline-flex';
        viewerSep.style.display = 'inline';
        if(liveDot) liveDot.style.display = 'block';
      } else {
        viewerStat.style.display = 'none';
        viewerSep.style.display = 'none';
        if(liveDot) liveDot.style.display = 'none';
      }
      if(u.followers){
        followerCount.textContent = fmt(u.followers.totalCount);
      }
    }catch(e){ /* silent fail, keep placeholders */ }
  }
  loadStats();
  setInterval(loadStats, 60000);
})();
